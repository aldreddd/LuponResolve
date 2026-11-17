
require("dotenv").config();

const pool = require("./config/postgres");

async function inspectCaseSchema() {
    try {
        console.log("\n===== CASES TABLE COLUMNS =====");

        const columns = await pool.query(`
            SELECT
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_name = 'cases'
              AND table_schema = 'public'
            ORDER BY ordinal_position
        `);

        console.table(columns.rows);

        console.log("\n===== CASES TABLE CONSTRAINTS =====");

        const constraints = await pool.query(`
            SELECT
                constraint_name,
                constraint_type
            FROM information_schema.table_constraints
            WHERE table_name = 'cases'
              AND table_schema = 'public'
            ORDER BY constraint_type, constraint_name
        `);

        console.table(constraints.rows);

        console.log("\nSchema inspection completed.");

    } catch (error) {
        console.error("Schema inspection failed:", error.message);

    } finally {
        await pool.end();
    }
}

inspectCaseSchema();
