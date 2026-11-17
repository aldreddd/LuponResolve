
require("dotenv").config();

const pool = require("./config/postgres");

async function checkCases() {
    try {
        const result = await pool.query(`
            SELECT
                id,
                case_number,
                status,
                case_stage
            FROM cases
            ORDER BY id
        `);

        console.table(result.rows);

    } catch (error) {
        console.error(error.message);

    } finally {
        await pool.end();
    }
}

checkCases();
