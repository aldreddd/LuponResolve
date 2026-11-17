
require("dotenv").config();

const pool = require("./config/postgres");

async function inspectTarget() {
    try {
        const caseResult = await pool.query(
            `
            SELECT
                id,
                case_number,
                status,
                case_stage,
                complainant_name,
                respondent_name
            FROM cases
            WHERE id = 5
            `
        );

        console.log("\n===== TEST CASE =====");
        console.table(caseResult.rows);

        const hearingResult = await pool.query(
            `
            SELECT
                id,
                case_id,
                hearing_type,
                scheduled_at,
                status,
                venue
            FROM hearings
            WHERE case_id = 5
            ORDER BY id DESC
            `
        );

        console.log("\n===== EXISTING HEARINGS =====");
        console.table(hearingResult.rows);

    } catch (error) {
        console.error("Inspection failed:", error.message);

    } finally {
        await pool.end();
    }
}

inspectTarget();
