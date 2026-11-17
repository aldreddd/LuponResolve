
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "..", "..", "config", "luponresolve.db");

const db = new sqlite3.Database(dbPath, (error) => {
    if (error) {
        console.error("SQLite connection failed:", error.message);
        return;
    }

    console.log("Connected to existing SQLite database.\n");

    const tables = [
        "users",
        "cases",
        "case_assignments",
        "sessions"
    ];

    let completed = 0;

    tables.forEach((table) => {
        db.get(
            `SELECT COUNT(*) AS total FROM "${table}"`,
            [],
            (error, row) => {
                if (error) {
                    console.log(`${table}: Not found or unavailable`);
                } else {
                    console.log(`${table}: ${row.total} records`);
                }

                completed++;

                if (completed === tables.length) {
                    console.log("\nSQLite inspection completed.");
                    db.close();
                }
            }
        );
    });
});

