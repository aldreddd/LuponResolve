
const db = require("./config/database");

const email = process.argv[2];
const newRole = process.argv[3];

const allowedRoles = [
    "resident",
    "secretary",
    "lupon",
    "admin"
];

if (!email || !allowedRoles.includes(newRole)) {
    console.log("Usage: node setUserRole.js <email> <role>");
    db.close();
    process.exit(1);
}

db.run(
    "UPDATE users SET role = ? WHERE email = ?",
    [newRole, email.trim().toLowerCase()],
    function (error) {
        if (error) {
            console.error("Role update failed:", error.message);
        } else if (this.changes === 0) {
            console.log("No account found with that email.");
        } else {
            console.log("Account role updated successfully!");
            console.log("Email:", email);
            console.log("New role:", newRole);
        }

        db.close();
    }
);
