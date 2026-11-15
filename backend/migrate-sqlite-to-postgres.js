
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const pool = require("./config/postgres");

const dbPath = path.join(__dirname, "config", "luponresolve.db");
const sqlite = new sqlite3.Database(dbPath);

function getSqliteRows(table) {
    return new Promise((resolve, reject) => {
        sqlite.all(`SELECT * FROM "${table}"`, [], (error, rows) => {
            if (error) reject(error);
            else resolve(rows);
        });
    });
}

const tables = {
    users: [
        "id",
        "full_name",
        "email",
        "password",
        "role",
        "created_at"
    ],

    cases: [
        "id",
        "case_number",
        "resident_id",
        "complainant_name",
        "respondent_name",
        "dispute_type",
        "incident_details",
        "status",
        "screening_status",
        "screening_reasons",
        "screening_warnings",
        "screening_answers",
        "secretary_notes",
        "case_stage",
        "arbitration_applicable",
        "case_history",
        "case_proceedings",
        "created_at",
        "updated_at",
        "resolution_outcome",
        "resolution_notes",
        "resolved_at",
        "resolved_by",
        "closure_notes",
        "closed_at",
        "closed_by"
    ],

    case_assignments: [
        "id",
        "case_id",
        "lupon_user_id",
        "assigned_at"
    ]
};

async function migrate() {
    let client;
    let transactionStarted = false;

    try {
        console.log("Reading existing SQLite records...");

        const sourceData = {};

        for (const table of Object.keys(tables)) {
            sourceData[table] = await getSqliteRows(table);
            console.log(
                `${table}: ${sourceData[table].length} records found`
            );
        }

        client = await pool.connect();

        // Protect against accidental duplicate migration.
        for (const table of Object.keys(tables)) {
            const result = await client.query(
                `SELECT COUNT(*) FROM ${table}`
            );

            if (Number(result.rows[0].count) !== 0) {
                throw new Error(
                    `Neon table "${table}" is not empty. Migration stopped.`
                );
            }
        }

        await client.query("BEGIN");
        transactionStarted = true;

        // Insert users first to preserve foreign-key relationships.
        for (const table of ["users", "cases", "case_assignments"]) {
            const columns = tables[table];

            for (const row of sourceData[table]) {
                const values = columns.map(column => row[column]);

                const placeholders = values
                    .map((_, index) => `$${index + 1}`)
                    .join(", ");

                await client.query(
                    `INSERT INTO ${table}
                    (${columns.join(", ")})
                    VALUES (${placeholders})`,
                    values
                );
            }

            console.log(`Migrated ${table} successfully.`);
        }

        // Synchronize PostgreSQL identity sequences.
        for (const table of Object.keys(tables)) {
            await client.query(`
                SELECT setval(
                    pg_get_serial_sequence('${table}', 'id'),
                    COALESCE((SELECT MAX(id) FROM ${table}), 1),
                    EXISTS (SELECT 1 FROM ${table})
                )
            `);
        }

        await client.query("COMMIT");
        transactionStarted = false;

        console.log("\nMIGRATION COMPLETED SUCCESSFULLY!");

    } catch (error) {
        if (client && transactionStarted) {
            await client.query("ROLLBACK");
            console.log("Migration rolled back.");
        }

        console.error("\nMIGRATION FAILED:");
        console.error(error.message);

        process.exitCode = 1;

    } finally {
        if (client) client.release();

        sqlite.close();

        await pool.end();
    }
}

migrate();
