require("dotenv").config({
    path: require("path").resolve(__dirname, "../../.env")
});

const bcrypt = require("bcryptjs");
const pool = require("../../config/postgres");

async function createAdmin() {
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const fullName = process.env.ADMIN_FULL_NAME || "LuponResolve Administrator";
    const password = process.env.ADMIN_PASSWORD || "";

    try {
        if (!email || !password) {
            throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
        }

        if (password.length < 12 || password.length > 72) {
            throw new Error("Password must be between 12 and 72 characters.");
        }

        const existing = await pool.query(
            "SELECT id, email, role FROM users WHERE email = $1",
            [email]
        );

        if (existing.rowCount > 0) {
            console.log("An account with this email already exists:");
            console.log(existing.rows[0]);
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO users (full_name, email, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, full_name, email, role`,
            [fullName, email, hashedPassword, "admin"]
        );

        console.log("\nADMIN ACCOUNT CREATED SUCCESSFULLY!");
        console.log(result.rows[0]);

    } catch (error) {
        console.error("\nADMIN CREATION FAILED:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

createAdmin();
