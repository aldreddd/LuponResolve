
require("dotenv").config();

const pool = require("./config/postgres");

async function checkColumns() {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'cases'
              AND column_name IN (
                  'respondent_address',
                  'respondent_email'
              )
            ORDER BY column_name
        `);

        console.table(result.rows);

        console.log(
            "Columns found:",
            result.rows.length,
            "out of 2"
        );

    } catch (error) {
        console.error("Column verification failed:", error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

checkColumns();
