
require("dotenv").config();

const pool = require("./config/postgres");

async function inspectResidents() {
    try {
        console.log("\n===== USERS TABLE STRUCTURE =====");

        const columns = await pool.query(`
            SELECT
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_name = 'users'
              AND table_schema = 'public'
            ORDER BY ordinal_position
        `);

        console.table(columns.rows);

        console.log("\n===== RESIDENT ACCOUNTS =====");

        const residents = await pool.query(`
            SELECT
                id,
                full_name,
                role
            FROM users
            WHERE role = 'resident'
            ORDER BY id
        `);

        console.table(residents.rows);

        console.log("\nResident inspection completed.");

    } catch (error) {
        console.error("Inspection failed:", error.message);

    } finally {
        await pool.end();
    }
}

inspectResidents();
