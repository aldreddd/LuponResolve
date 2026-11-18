
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
// ======================================
// POST /api/auth/register
// PUBLIC REGISTRATION DISABLED
// ======================================

router.post("/register", (req, res) => {
    return res.status(403).json({
        success: false,
        message: "Resident registration is disabled. Residents may submit complaints without an account."
    });
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
        // ======================================
        // RESIDENT LOGIN DISABLED
        // ======================================

        if (user.role === "resident") {
            return res.status(403).json({
                success: false,
                message: "Resident accounts no longer use login. Please file complaints through the public complaint form."
            });
        }
                // Resident accounts no longer use the login portal.
        if (user.role === "resident") {
            return res.status(403).json({
                success: false,
                message: "Resident accounts no longer use login. Please file complaints through the public complaint form."
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
