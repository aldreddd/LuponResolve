
const initializePostgresSchema = require("./config/postgresSchema");

async function setupDatabase() {
    try {
        await initializePostgresSchema();
        console.log("PostgreSQL database setup completed!");
    } catch (error) {
        console.error("Database setup failed:");
        console.error(error);
        process.exitCode = 1;
    } finally {
        const pool = require("./config/postgres");
        await pool.end();
    }
}

setupDatabase();
