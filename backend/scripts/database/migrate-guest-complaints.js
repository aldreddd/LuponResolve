require("dotenv").config();

const pool = require("../../config/postgres");

async function migrateGuestComplaints() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Allow guest-submitted cases without a resident account.
        await client.query(`
            ALTER TABLE cases
            DROP CONSTRAINT IF EXISTS cases_resident_id_not_null
        `);

        await client.query(`
            ALTER TABLE cases
            ALTER COLUMN resident_id DROP NOT NULL
        `);

        // Save complainant contact number.
        await client.query(`
            ALTER TABLE cases
            ADD COLUMN IF NOT EXISTS complainant_contact TEXT
        `);

        await client.query("COMMIT");

        console.log("Guest complaint migration completed successfully.");
        console.log("- resident_id is now nullable");
        console.log("- complainant_contact column is available");

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Guest complaint migration failed:", error.message);
        process.exitCode = 1;

    } finally {
        client.release();
        await pool.end();
    }
}

migrateGuestComplaints();