
const pool = require("./config/postgres");

async function testConnection() {
    try {
        const result = await pool.query(`
            SELECT
                NOW() AS current_time,
                current_database() AS database_name,
                current_user AS connected_user
        `);

        console.log("Neon connection successful!");
        console.log(result.rows[0]);

    } catch (error) {
        console.error("Neon connection failed:");
        console.error(error.message);

    } finally {
        await pool.end();
    }
}

testConnection();
