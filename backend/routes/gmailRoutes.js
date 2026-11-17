
const express = require("express");
const crypto = require("crypto");

const {
    requireAuth,
    requireRole
} = require("../middleware/authMiddleware");

const {
    getOAuthClient,
    saveRefreshToken,
    getRefreshToken,
    sendGmailMessage,
    disconnectGmail
} = require("../services/gmailService");

const router = express.Router();

// Gmail sending permission only.
const GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.send"
];

// ======================================
// ADMIN ACCESS
// ======================================

const requireAdmin = [
    requireAuth,
    requireRole("admin")
];

// ======================================
// START GMAIL CONNECTION
// ======================================

router.get("/connect", requireAdmin, async (req, res) => {
    try {
        const oauth2Client = getOAuthClient();

        const state = crypto.randomBytes(32).toString("hex");

        req.session.gmailOAuthState = state;

        const authorizationUrl = oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: GMAIL_SCOPES,
            state
        });

        req.session.save(error => {
            if (error) {
                console.error("Gmail session save failed:", error);
                return res.status(500).send("Unable to start Gmail authorization.");
            }

            res.redirect(authorizationUrl);
        });

    } catch (error) {
        console.error("Gmail connection initialization failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to initialize Gmail connection."
        });
    }
});

// ======================================
// GOOGLE OAUTH CALLBACK
// ======================================

router.get("/callback", requireAdmin, async (req, res) => {
    try {
        const { code, state, error: googleError } = req.query;

        if (googleError) {
            delete req.session.gmailOAuthState;

            return res.status(400).send(
                "Gmail authorization was not completed. You may close this page."
            );
        }

        const savedState = req.session.gmailOAuthState;

        if (
            typeof state !== "string" ||
            typeof savedState !== "string"
        ) {
            return res.status(403).send("Invalid Gmail authorization state.");
        }

        const receivedState = Buffer.from(state);
        const expectedState = Buffer.from(savedState);

        if (
            receivedState.length !== expectedState.length ||
            !crypto.timingSafeEqual(receivedState, expectedState)
        ) {
            return res.status(403).send("Gmail authorization state verification failed.");
        }

        delete req.session.gmailOAuthState;

        await new Promise((resolve, reject) => {
            req.session.save(error => {
                if (error) reject(error);
                else resolve();
            });
        });

        if (typeof code !== "string" || !code) {
            return res.status(400).send("Google did not return an authorization code.");
        }

        const oauth2Client = getOAuthClient();

        const { tokens } = await oauth2Client.getToken(code);

        if (tokens.refresh_token) {
            await saveRefreshToken(tokens.refresh_token);
        } else {
            const existingToken = await getRefreshToken();

            if (!existingToken) {
                return res.status(400).send(
                    "Google did not provide a refresh token. Please restart Gmail authorization."
                );
            }
        }

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Gmail Connected - LuponResolve</title>
            </head>
            <body style="font-family: Arial, sans-serif; max-width: 560px; margin: 80px auto; padding: 24px; text-align: center; color: #243447;">
                <h1>Gmail Connected</h1>
                <p>Your LuponResolve Gmail account has been authorized successfully.</p>
                <p>You may close this page and return to LuponResolve.</p>
            </body>
            </html>
        `);

    } catch (error) {
        console.error("Gmail OAuth callback failed:", error.message);

        res.status(500).send(
            "Gmail authorization failed. Please check the backend logs."
        );
    }
});

// ======================================
// CHECK GMAIL CONNECTION
// ======================================

router.get("/status", requireAdmin, async (req, res) => {
    try {
        const refreshToken = await getRefreshToken();

        res.json({
            success: true,
            connected: Boolean(refreshToken)
        });

    } catch (error) {
        console.error("Gmail status check failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to check Gmail connection."
        });
    }
});


// ======================================
// TEST GMAIL EMAIL DELIVERY
// ======================================

router.post("/test-send", requireAdmin, async (req, res) => {
    try {
        // Always send to the currently logged-in admin.
        const recipient = req.session.user.email;

        const result = await sendGmailMessage({
            to: recipient,
            subject: "LuponResolve Gmail Integration Test",
            text: [
                "Hello!",
                "",
                "This is a test email from LuponResolve.",
                "",
                "Your Gmail API integration is successfully sending emails.",
                "",
                "This is only a test. No hearing notifications were triggered.",
                "",
                "LuponResolve System"
            ].join("\n")
        });

        res.json({
            success: true,
            message: "Test email sent successfully through Gmail.",
            recipient,
            emailId: result.emailId
        });

    } catch (error) {
        console.error("Gmail test email failed:", error);

        res.status(500).json({
            success: false,
            message: "Gmail test email failed.",
            error: error.message
        });
    }
});


// ======================================
// DISCONNECT GMAIL
// ======================================

router.post("/disconnect", requireAdmin, async (req, res) => {
    try {
        await disconnectGmail();

        res.json({
            success: true,
            message: "Gmail account disconnected from LuponResolve."
        });

    } catch (error) {
        console.error("Gmail disconnection failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to disconnect Gmail."
        });
    }
});

module.exports = router;
