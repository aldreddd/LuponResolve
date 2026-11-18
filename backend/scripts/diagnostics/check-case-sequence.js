const pool = require("../../config/postgres");

async function checkCaseSequence() {
    try {
        console.log("\n===== CASE ID SEQUENCE CHECK =====\n");

        // Read the highest case ID and the sequence name.
        const result = await pool.query(`
            SELECT
                pg_get_serial_sequence('public.cases', 'id') AS sequence_name,
                MAX(id) AS highest_case_id
            FROM cases
        `);

        const sequenceName = result.rows[0].sequence_name;
        const highestId = result.rows[0].highest_case_id;

        console.log("Sequence name:", sequenceName);
        console.log("Highest case ID:", highestId);

        if (!sequenceName) {
            console.log("No sequence is associated with the cases.id column.");
            return;
        }

        // Inspect sequence metadata without changing it.
        const parts = sequenceName.split(".");
        const schemaName = parts.length > 1
            ? parts[0].replace(/"/g, "")
            : "public";

        const seqName = parts.length > 1
            ? parts[1].replace(/"/g, "")
            : parts[0];

        const sequenceResult = await pool.query(`
            SELECT
                last_value,
                increment_by,
                max_value,
                cycle
            FROM pg_sequences
            WHERE schemaname = $1
              AND sequencename = $2
        `, [schemaName, seqName]);

        console.log("\n===== SEQUENCE METADATA =====\n");
        console.table(sequenceResult.rows);

        console.log("\n===== CHECK COMPLETE =====");

    } catch (error) {
        console.error("Sequence diagnostic failed:", error.message);
    } finally {
        await pool.end();
    }
}

checkCaseSequence();