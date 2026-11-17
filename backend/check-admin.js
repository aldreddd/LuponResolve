
require("dotenv").config();

const pool = require("./config/postgres");

async function checkAdmin() {
    try {
        const result = await pool.query(
            "SELECT id, role FROM users WHERE id = $1",
            [9]
        );

        console.table(result.rows);

    } catch (error) {
        console.error(error.message);

    } finally {
        await pool.end();
    }
}

checkAdmin();
