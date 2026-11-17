
const initializePostgresSchema = require("./config/postgresSchema");
const initializeHearingSchema = require("./config/hearingSchema");

async function setupDatabase() {
    try {
        // Initialize existing application tables first.
        await initializePostgresSchema();

        // Initialize hearing management tables afterward.
        await initializeHearingSchema();

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
