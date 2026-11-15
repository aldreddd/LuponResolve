
const pool = require("./config/postgres");

async function verifyMigration() {
    try {
        const tables = ["users", "cases", "case_assignments"];

        console.log("Checking Neon PostgreSQL records...\n");

        for (const table of tables) {
            const result = await pool.query(
                `SELECT COUNT(*) AS total FROM ${table}`
            );

            console.log(`${table}: ${result.rows[0].total} records`);
        }

        const relationships = await pool.query(`
            SELECT
                COUNT(*) FILTER (
                    WHERE u.id IS NULL
                ) AS missing_users,

                COUNT(*) FILTER (
                    WHERE c.id IS NULL
                ) AS missing_cases

            FROM case_assignments a
            LEFT JOIN users u
                ON u.id = a.lupon_user_id
            LEFT JOIN cases c
                ON c.id = a.case_id
        `);

        console.log("\nRelationship verification:");
        console.log(relationships.rows[0]);

        console.log("\nVerification completed.");

    } catch (error) {
        console.error("Verification failed:", error.message);
        process.exitCode = 1;

    } finally {
        await pool.end();
    }
}

verifyMigration();
