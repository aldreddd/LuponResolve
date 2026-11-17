
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const databasePath = path.join(__dirname, "luponresolve.db");

const db = new sqlite3.Database(databasePath, (error) => {
    if (error) {
        console.error("Database connection failed:", error.message);
    } else {
        console.log("Connected to LuponResolve database!");
    }
});

// Enable foreign-key relationships.
db.run("PRAGMA foreign_keys = ON");

// Add new database columns without affecting existing records.
function ensureCaseColumns(columns, index = 0) {
    if (index >= columns.length) {
        console.log("Case resolution and closure fields are ready!");
        return;
    }

    const column = columns[index];

    db.all("PRAGMA table_info(cases)", (error, existingColumns) => {
        if (error) {
            console.error("Unable to inspect cases table:", error.message);
            return;
        }

        const alreadyExists = existingColumns.some(
            item => item.name === column.name
        );

        if (alreadyExists) {
            ensureCaseColumns(columns, index + 1);
            return;
        }

        db.run(
            `ALTER TABLE cases ADD COLUMN ${column.name} ${column.definition}`,
            (alterError) => {
                if (alterError) {
                    console.error(
                        `Unable to add ${column.name}:`,
                        alterError.message
                    );
                    return;
                }

                console.log(`Added database field: ${column.name}`);

                ensureCaseColumns(columns, index + 1);
            }
        );
    });
}

db.serialize(() => {
    // User accounts
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'resident',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Resident complaints / cases
    db.run(`
        CREATE TABLE IF NOT EXISTS cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_number TEXT UNIQUE,
            resident_id INTEGER NOT NULL,

            complainant_name TEXT NOT NULL,
            respondent_name TEXT NOT NULL,
            dispute_type TEXT NOT NULL,
            incident_details TEXT NOT NULL,

            status TEXT NOT NULL DEFAULT 'Pending Review',

            screening_status TEXT,
            screening_reasons TEXT,
            screening_warnings TEXT,
            screening_answers TEXT,

            secretary_notes TEXT DEFAULT '',
            case_stage TEXT DEFAULT 'Secretary Review',
            arbitration_applicable INTEGER DEFAULT 0,

            case_history TEXT DEFAULT '[]',
            case_proceedings TEXT DEFAULT '[]',

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (resident_id)
                REFERENCES users(id)
                ON DELETE RESTRICT
        )
        `, (error) => {
        if (error) {
            console.error("Cases table creation failed:", error.message);
        } else {
            console.log("Cases table is ready!");

            ensureCaseColumns([
                {
                    name: "resolution_outcome",
                    definition: "TEXT"
                },
                {
                    name: "resolution_notes",
                    definition: "TEXT DEFAULT ''"
                },
                {
                    name: "resolved_at",
                    definition: "DATETIME"
                },
                {
                    name: "resolved_by",
                    definition: "INTEGER"
                },
                {
                    name: "closure_notes",
                    definition: "TEXT DEFAULT ''"
                },
                {
                    name: "closed_at",
                    definition: "DATETIME"
                },
                {
                    name: "closed_by",
                    definition: "INTEGER"
                }
            ]);
        }
    });

    // Lupon assignment records.
    // A Lupon member can only access cases assigned to them.
    db.run(`
        CREATE TABLE IF NOT EXISTS case_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id INTEGER NOT NULL,
            lupon_user_id INTEGER NOT NULL,
            assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            UNIQUE(case_id, lupon_user_id),

            FOREIGN KEY (case_id)
                REFERENCES cases(id)
                ON DELETE CASCADE,

            FOREIGN KEY (lupon_user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `, (error) => {
        if (error) {
            console.error("Assignments table creation failed:", error.message);
        } else {
            console.log("Case assignments table is ready!");
        }
    });

    db.run(`
        CREATE INDEX IF NOT EXISTS idx_cases_resident
        ON cases(resident_id)
    `);

    db.run(`
        CREATE INDEX IF NOT EXISTS idx_assignments_lupon
        ON case_assignments(lupon_user_id)
    `);
});

module.exports = db;
