
require("dotenv").config();

const pool = require("./config/postgres");

async function checkTestAccounts() {
    try {
        const result = await pool.query(`
            SELECT
                id,
                full_name,
                role,
                CASE
                    WHEN email IS NOT NULL AND email <> ''
                    THEN TRUE
                    ELSE FALSE
                END AS has_email,
                CASE
                    WHEN password IS NOT NULL AND password <> ''
                    THEN TRUE
                    ELSE FALSE
                END AS has_password_hash
            FROM users
            WHERE id IN (5, 6)
            ORDER BY id
        `);

        console.log("\n===== TEST ACCOUNT CHECK =====");
        console.table(result.rows);

        console.log("\nNo passwords or email addresses were displayed.");

    } catch (error) {
        console.error("Account inspection failed:", error.message);

    } finally {
        await pool.end();
    }
}

checkTestAccounts();
