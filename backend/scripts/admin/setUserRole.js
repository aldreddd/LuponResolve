
const pool = require("../../config/postgres");

const email = process.argv[2];
const newRole = process.argv[3];

const allowedRoles = [
    "resident",
    "secretary",
    "lupon",
    "admin"
];

async function updateUserRole() {
    if (!email || !allowedRoles.includes(newRole)) {
        console.log("Usage: node setUserRole.js <email> <role>");
        await pool.end();
        process.exitCode = 1;
        return;
    }

    try {
        const result = await pool.query(
            `UPDATE users
             SET role = $1
             WHERE email = $2
             RETURNING id, full_name, email, role`,
            [newRole, email.trim().toLowerCase()]
        );

        if (result.rowCount === 0) {
            console.log("No account found with that email.");
        } else {
            console.log("Account role updated successfully!");
            console.log("ACCOUNT:", result.rows[0]);
        }
    } catch (error) {
        console.error("Role update failed:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

updateUserRole();

