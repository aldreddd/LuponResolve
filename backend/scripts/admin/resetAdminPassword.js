
require("dotenv").config({
    path: require("path").resolve(__dirname, "../../.env")
});

const bcrypt = require("bcryptjs");
const pool = require("../../config/postgres");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function resetAdminPassword() {
    try {
        const email = "admin@gmail.com";

        const password = await new Promise(resolve => {
            rl.question("Enter your new admin password: ", resolve);
        });

        if (password.length < 12 || password.length > 72) {
            throw new Error("Password must be between 12 and 72 characters.");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `UPDATE users
             SET password = $1
             WHERE email = $2 AND role = 'admin'
             RETURNING id, full_name, email, role`,
            [hashedPassword, email]
        );

        if (result.rowCount === 0) {
            console.log("Admin account not found.");
        } else {
            console.log("\nAdmin password updated successfully!");
            console.log(result.rows[0]);
        }

    } catch (error) {
        console.error("Password reset failed:", error.message);
        process.exitCode = 1;
    } finally {
        rl.close();
        await pool.end();
    }
}

resetAdminPassword();
