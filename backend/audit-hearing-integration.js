
require("dotenv").config();

const pool = require("./config/postgres");

async function auditHearingIntegration() {
    try {
        console.log("\n===== HEARING INTEGRATION AUDIT =====");

        // 1. Inspect the test hearing
        const hearingResult = await pool.query(
            `
            SELECT
                id,
                case_id,
                hearing_type,
                scheduled_at,
                status,
                venue
            FROM hearings
            WHERE id = 2
            `
        );

        console.log("\n===== FINAL HEARING =====");
        console.table(hearingResult.rows);

        // 2. Inspect notification delivery records
        const notificationResult = await pool.query(
            `
            SELECT
                id,
                hearing_id,
                party_type,
                notification_type,
                delivery_status,
                provider_message_id,
                sent_at
            FROM hearing_notifications
            WHERE hearing_id = 2
            ORDER BY id ASC
            `
        );

        console.log("\n===== NOTIFICATION RECORDS =====");
        console.table(notificationResult.rows);

        // 3. Count notifications by action and status
        const summaryResult = await pool.query(
            `
            SELECT
                notification_type,
                delivery_status,
                COUNT(*) AS total
            FROM hearing_notifications
            WHERE hearing_id = 2
            GROUP BY notification_type, delivery_status
            ORDER BY notification_type
            `
        );

        console.log("\n===== NOTIFICATION SUMMARY =====");
        console.table(summaryResult.rows);

        // 4. Inspect hearing history
        const historyResult = await pool.query(
            `
            SELECT
                action,
                details,
                created_at
            FROM hearing_history
            WHERE hearing_id = 2
            ORDER BY created_at ASC
            `
        );

        console.log("\n===== HEARING HISTORY =====");
        console.table(historyResult.rows);

    } catch (error) {
        console.error("\nAudit failed:", error.message);

    } finally {
        await pool.end();
    }
}

auditHearingIntegration();
