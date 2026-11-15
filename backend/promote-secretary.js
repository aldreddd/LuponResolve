
const pool = require("./config/postgres");

async function promoteLuponMember() {
    const email = "nathanielmandin7@gmail.com";
    const fullName = "Nathaniel Mandin";

    try {
        const result = await pool.query(
            `UPDATE users
             SET role = $1
             WHERE email = $2
             AND full_name = $3
             RETURNING id, full_name, email, role`,
            ["lupon", email, fullName]
        );

        if (result.rowCount === 1) {
            console.log("SUCCESS: Nathaniel Mandin is now a Lupon member!");
            console.log("ACCOUNT:", result.rows[0]);
        } else {
            console.log("No account was changed. Check the name and email.");

            const account = await pool.query(
                `SELECT id, full_name, email, role
                 FROM users
                 WHERE email = $1`,
                [email]
            );

            console.log("ACCOUNT:", account.rows[0] || "Not found");
        }
    } catch (error) {
        console.error("Promotion failed:", error.message);
    } finally {
        await pool.end();
    }
}

promoteLuponMember();
