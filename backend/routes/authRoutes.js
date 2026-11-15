
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/postgres");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// ======================================
// LOGIN RATE LIMITER
// ======================================

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes."
    }
});

// ======================================
// REGISTRATION RATE LIMITER
// ======================================

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many registration attempts. Please try again after one hour."
    }
});

// ======================================
// POST /api/auth/register
// Register a new resident account
// ======================================

router.post("/register", registerLimiter, async (req, res) => {
    try {
        const { fullName, email, password } = req.body || {};

        if (
            typeof fullName !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !fullName.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid name, email, and password."
            });
        }

        const cleanName = fullName.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (cleanName.length < 2 || cleanName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Full name must be between 2 and 100 characters."
            });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        if (password.length > 72) {
            return res.status(400).json({
                success: false,
                message: "Password must not exceed 72 characters."
            });
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [cleanEmail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This email address is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO users (full_name, email, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [cleanName, cleanEmail, hashedPassword, "resident"]
        );

        return res.status(201).json({
            success: true,
            message: "Resident account created successfully!",
            user: {
                id: result.rows[0].id,
                fullName: cleanName,
                email: cleanEmail,
                role: "resident"
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This email address is already registered."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create your account."
        });
    }
});

// ======================================
// TEMPORARY TEST ROUTE
// ======================================

router.get("/test", (req, res) => {
    res.json({
        message: "Authentication routes are working!"
    });
});

// ======================================
// POST /api/auth/login
// Authenticate an existing user
// ======================================

router.post("/login", loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password ||
            password.length > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email and password."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [cleanEmail]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Regenerate session to prevent session fixation.
        req.session.regenerate((sessionError) => {
            if (sessionError) {
                console.error("Session error:", sessionError);

                return res.status(500).json({
                    success: false,
                    message: "Unable to create login session."
                });
            }

            req.session.user = {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                role: user.role
            };

            req.session.save((saveError) => {
                if (saveError) {
                    console.error("Session save error:", saveError);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to save login session."
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: "Login successful!",
                    user: req.session.user
                });
            });
        });

    } catch (error) {
        console.error("Login database error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to process login."
        });
    }
});

// ======================================
// GET /api/auth/me
// Check currently authenticated user
// ======================================

router.get("/me", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "You are not logged in."
        });
    }

    return res.status(200).json({
        success: true,
        message: "Authenticated user found!",
        user: req.session.user
    });
});

// ======================================
// POST /api/auth/logout
// Destroy the current session
// ======================================

router.post("/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error("Logout error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to log out."
            });
        }

        res.clearCookie("connect.sid", {
            path: "/"
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful!"
        });
    });
});

module.exports = router;
