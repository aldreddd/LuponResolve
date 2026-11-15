
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_POOLED,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on("connect", () => {
    console.log("Connected to Neon PostgreSQL!");
});

pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL pool error:", err);
});

module.exports = pool;
