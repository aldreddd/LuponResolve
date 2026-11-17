
const { google } = require("googleapis");
const crypto = require("crypto");
const pool = require("../config/postgres");

// ======================================
// GOOGLE OAUTH CONFIGURATION
// ======================================

function getOAuthClient() {
    const {
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GMAIL_REDIRECT_URI
    } = process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GMAIL_REDIRECT_URI) {
        throw new Error("Google Gmail OAuth environment variables are incomplete.");
    }

    return new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GMAIL_REDIRECT_URI
    );
}

// ======================================
// TOKEN ENCRYPTION
// ======================================

function getEncryptionKey() {
    const key = process.env.GMAIL_TOKEN_ENCRYPTION_KEY;

    if (!key || !/^[a-f0-9]{64}$/i.test(key)) {
        throw new Error("GMAIL_TOKEN_ENCRYPTION_KEY must be a 32-byte hexadecimal key.");
    }

    return Buffer.from(key, "hex");
}

function encryptToken(token) {
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
        "aes-256-gcm",
        getEncryptionKey(),
        iv
    );

    const encrypted = Buffer.concat([
        cipher.update(token, "utf8"),
        cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted.toString("hex")
    ].join(":");
}

function decryptToken(encryptedToken) {
    const [ivHex, authTagHex, encryptedHex] = encryptedToken.split(":");

    if (!ivHex || !authTagHex || !encryptedHex) {
        throw new Error("Stored Gmail token has an invalid format.");
    }

    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        getEncryptionKey(),
        Buffer.from(ivHex, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    return Buffer.concat([
        decipher.update(Buffer.from(encryptedHex, "hex")),
        decipher.final()
    ]).toString("utf8");
}

// ======================================
// DATABASE TABLE
// ======================================

let tableReady;

async function ensureGmailTable() {
    if (!tableReady) {
        tableReady = pool.query(`
            CREATE TABLE IF NOT EXISTS gmail_integrations (
                id SMALLINT PRIMARY KEY CHECK (id = 1),
                refresh_token_encrypted TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `).catch(error => {
            tableReady = null;
            throw error;
        });
    }

    await tableReady;
}

// ======================================
// SAVE REFRESH TOKEN
// ======================================

async function saveRefreshToken(refreshToken) {
    if (!refreshToken) {
        throw new Error("Google did not provide a refresh token.");
    }

    await ensureGmailTable();

    const encryptedToken = encryptToken(refreshToken);

    await pool.query(
        `
            INSERT INTO gmail_integrations (
                id,
                refresh_token_encrypted
            )
            VALUES (1, $1)
            ON CONFLICT (id)
            DO UPDATE SET
                refresh_token_encrypted = EXCLUDED.refresh_token_encrypted,
                updated_at = CURRENT_TIMESTAMP
        `,
        [encryptedToken]
    );
}

// ======================================
// LOAD REFRESH TOKEN
// ======================================

async function getRefreshToken() {
    await ensureGmailTable();

    const result = await pool.query(
        `
            SELECT refresh_token_encrypted
            FROM gmail_integrations
            WHERE id = 1
        `
    );

    if (result.rows.length === 0) {
        return null;
    }

    return decryptToken(result.rows[0].refresh_token_encrypted);
}

// ======================================
// CREATE AUTHENTICATED GMAIL CLIENT
// ======================================

async function getGmailClient() {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
        throw new Error("Gmail has not been connected by an administrator.");
    }

    const oauth2Client = getOAuthClient();

    oauth2Client.setCredentials({
        refresh_token: refreshToken
    });

    return google.gmail({
        version: "v1",
        auth: oauth2Client
    });
}


// ======================================
// SEND EMAIL THROUGH GMAIL API
// ======================================


async function sendGmailMessage({ to, subject, html }) {
    if (!to || !subject || !html) {
        throw new Error("Recipient, subject, and HTML message are required.");
    }

    const recipients = Array.isArray(to) ? to.join(", ") : to;

    if (/[\r\n]/.test(recipients) || /[\r\n]/.test(subject)) {
        throw new Error("Invalid email header values.");
    }

    const encodedHtml = Buffer
        .from(html, "utf8")
        .toString("base64")
        .match(/.{1,76}/g)
        .join("\r\n");

    const message = [
        `To: ${recipients}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "Content-Transfer-Encoding: base64",
        "",
        encodedHtml
    ].join("\r\n");

    const encodedMessage = Buffer
        .from(message, "utf8")
        .toString("base64url");

    const gmail = await getGmailClient();

    const result = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: encodedMessage
        }
    });

    console.log("HTML email sent through Gmail API:", result.data.id);

    return {
        success: true,
        emailId: result.data.id
    };
}



// ======================================
// DISCONNECT GMAIL
// ======================================

async function disconnectGmail() {
    await ensureGmailTable();

    await pool.query(
        "DELETE FROM gmail_integrations WHERE id = 1"
    );
}

module.exports = {
    getOAuthClient,
    saveRefreshToken,
    getRefreshToken,
    getGmailClient,
    sendGmailMessage,
    disconnectGmail
};