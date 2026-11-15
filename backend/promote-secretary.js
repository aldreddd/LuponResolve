
const db = require("./config/database");

db.run(
    `UPDATE users
     SET role = ?
     WHERE email = ?
     AND full_name = ?`,
    ["lupon", "nathanielmandin7@gmail.com", "Nathaniel Mandin"],
    function (error) {
        if (error) {
            console.error("Promotion failed:", error.message);
        } else if (this.changes === 1) {
            console.log("SUCCESS: Nathaniel Mandin is now a Lupon member!");
        } else {
            console.log("No account was changed. Check the name and email.");
        }

        db.get(
            `SELECT id, full_name, email, role
             FROM users
             WHERE email = ?`,
            ["nathanielmandin7@gmail.com"],
            (error, user) => {
                if (error) {
                    console.error(error.message);
                } else {
                    console.log("ACCOUNT:", user);
                }

                db.close();
            }
        );
    }
);
