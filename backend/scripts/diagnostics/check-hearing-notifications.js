
require("dotenv").config();

const pool = require("../../config/postgres");

async function checkNotifications() {
    try {
        const result = await pool.query(
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
            ORDER BY id DESC
            LIMIT 20
            `
        );

        console.log("\n===== SAVED NOTIFICATION RECORDS =====");
        console.table(result.rows);

    } catch (error) {
        console.error(error.message);

    } finally {
        await pool.end();
    }
}

checkNotifications();


