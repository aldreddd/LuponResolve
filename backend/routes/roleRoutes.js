
const express = require("express");

const router = express.Router();

// Import PostgreSQL connection
const pool = require("../config/postgres");

// Import security middleware
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
// SECRETARY AND ADMIN ONLY
// ======================================

router.get(
    "/lupon-members",
    requireAuth,
    requireRole("secretary", "admin"),
    async (req, res) => {

        try {

            const result = await pool.query(
                `SELECT id, full_name, email
                 FROM users
                 WHERE role = $1
                 ORDER BY full_name ASC`,
                ["lupon"]
            );

            res.json({
                success: true,
                members: result.rows.map(member => ({
                    id: member.id,
                    fullName: member.full_name,
                    email: member.email
                }))
            });

        } catch (error) {

            console.error("Failed to load Lupon members:", error);

            res.status(500).json({
                success: false,
                message: "Unable to retrieve Lupon members."
            });

        }

    }
);


module.exports = router;
