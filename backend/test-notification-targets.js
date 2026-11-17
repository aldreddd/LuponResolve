
require("dotenv").config();

const pool = require("./config/postgres");

async function testNotificationTargets() {
    try {
        const result = await pool.query(
            `
            SELECT
                h.id AS hearing_id,
                c.case_number,
                h.status,

                (
                    u.email IS NOT NULL
                    AND TRIM(u.email) <> ''
                ) AS complainant_email_available,

                (
                    c.respondent_email IS NOT NULL
                    AND TRIM(c.respondent_email) <> ''
                ) AS respondent_email_available

            FROM hearings h
            INNER JOIN cases c
                ON c.id = h.case_id
            LEFT JOIN users u
                ON u.id = c.resident_id
            WHERE h.id = $1
            `,
            [1]
        );

        if (result.rows.length === 0) {
            console.log("Test hearing not found.");
            return;
        }

        console.log("\n===== NOTIFICATION TARGET CHECK =====");
        console.table(result.rows);

        console.log("\nNo emails were sent.");

    } catch (error) {
        console.error("Target check failed:", error.message);

    } finally {
        await pool.end();
    }
}

testNotificationTargets();
