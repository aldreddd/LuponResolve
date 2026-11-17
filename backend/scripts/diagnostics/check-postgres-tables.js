
const pool = require("../../config/postgres");

async function checkTables() {
    try {
        const result = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        console.log("NEON POSTGRESQL TABLES:");
        console.table(result.rows);

    } catch (error) {
        console.error("Table verification failed:", error.message);
    } finally {
        await pool.end();
    }
}

checkTables();


