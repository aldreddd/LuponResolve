const pool = require("../../config/postgres");

async function checkCaseNumbers() {
    try {
        console.log("\n===== CASE NUMBER DUPLICATE CHECK =====\n");

        // Check for duplicate case numbers.
        const duplicates = await pool.query(`
            SELECT
                case_number,
                COUNT(*) AS duplicate_count,
                ARRAY_AGG(id ORDER BY id) AS case_ids
            FROM cases
            WHERE case_number IS NOT NULL
            GROUP BY case_number
            HAVING COUNT(*) > 1
            ORDER BY case_number
        `);

        if (duplicates.rows.length === 0) {
            console.log("No duplicate case numbers found. ✅");
        } else {
            console.log("DUPLICATES FOUND: ⚠️");
            console.table(duplicates.rows);
        }

        // Display existing case numbers for verification.
        const allCases = await pool.query(`
            SELECT
                id,
                case_number,
                complainant_name,
                created_at
            FROM cases
            ORDER BY id ASC
        `);

        console.log("\n===== EXISTING CASE NUMBERS =====\n");
        console.table(allCases.rows);

        console.log("\n===== CHECK COMPLETE =====");

    } catch (error) {
        console.error("Case number check failed:", error.message);
    } finally {
        await pool.end();
    }
}

checkCaseNumbers();