const express = require("express");

const router = express.Router();

// Import database connection
const db = require("../config/database");
// Import our security middleware
const {
    requireAuth,
    requireRole
} = require("../middleware/authMiddleware");


// ======================================
// RESIDENT ROUTE
// ======================================

router.get(
    "/resident",
    requireAuth,
    requireRole("resident"),
    (req, res) => {

        res.json({
            success: true,
            message: "Welcome to the Resident API!",
            user: req.session.user
        });

    }
);


// ======================================
// SECRETARY ROUTE
// ======================================

router.get(
    "/secretary",
    requireAuth,
    requireRole("secretary"),
    (req, res) => {

        res.json({
            success: true,
            message: "Welcome to the Secretary API!",
            user: req.session.user
        });

    }
);


// ======================================
// LUPON MEMBER ROUTE
// ======================================

router.get(
    "/lupon",
    requireAuth,
    requireRole("lupon"),
    (req, res) => {

        res.json({
            success: true,
            message: "Welcome to the Lupon Member API!",
            user: req.session.user
        });

    }
);


// ======================================
// ADMINISTRATOR ROUTE
// ======================================

router.get(
    "/admin",
    requireAuth,
    requireRole("admin"),
    (req, res) => {

        res.json({
            success: true,
            message: "Welcome to the Administrator API!",
            user: req.session.user
        });

    }
);

// ======================================
// GET ALL LUPON MEMBERS
// SECRETARY ONLY
// ======================================

router.get(
    "/lupon-members",
    requireAuth,
    requireRole("secretary", "admin"),
    (req, res) => {

        db.all(
            `SELECT id, full_name, email
             FROM users
             WHERE role = ?
             ORDER BY full_name ASC`,
            ["lupon"],
            (error, rows) => {

                if (error) {
                    console.error("Failed to load Lupon members:", error);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to retrieve Lupon members."
                    });
                }

                res.json({
                    success: true,
                    members: rows.map(member => ({
                        id: member.id,
                        fullName: member.full_name,
                        email: member.email
                    }))
                });

            }
        );

    }
);
module.exports = router;