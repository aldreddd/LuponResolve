const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/database");
const rateLimit = require("express-rate-limit");
const router = express.Router();

// ======================================
// LOGIN RATE LIMITER
// ======================================

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,                 // Maximum 5 requests
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
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 5,                 // Maximum 5 requests
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
        // 1. Get information from the request body
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

        // 3. Clean and validate the information
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

        if (typeof password !== "string" || password.length < 8) {
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

        // 4. Check whether the email is already registered
        db.get(
            "SELECT id FROM users WHERE email = ?",
            [cleanEmail],
            async (error, existingUser) => {

                if (error) {
                    console.error("Email lookup failed:", error);

                    return res.status(500).json({
                        success: false,
                        message: "Something went wrong while checking the account."
                    });
                }

                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        message: "This email address is already registered."
                    });
                }

                try {
                    // 5. Hash the password
                    const hashedPassword = await bcrypt.hash(password, 12);

                    // 6. Save the new account
                    // Public registration always creates a resident.
                    db.run(
                        `INSERT INTO users (full_name, email, password, role)
                         VALUES (?, ?, ?, ?)`,
                        [cleanName, cleanEmail, hashedPassword, "resident"],
                        function (insertError) {

                            if (insertError) {
                                console.error("Registration failed:", insertError);

                                if (insertError.code === "SQLITE_CONSTRAINT") {
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

                            // 7. Return the successful registration response
                            return res.status(201).json({
                                success: true,
                                message: "Resident account created successfully!",
                                user: {
                                    id: this.lastID,
                                    fullName: cleanName,
                                    email: cleanEmail,
                                    role: "resident"
                                }
                            });
                        }
                    );

                } catch (hashError) {
                    console.error("Password hashing failed:", hashError);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to process your registration."
                    });
                }
            }
        );

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "An unexpected server error occurred."
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

router.post("/login", loginLimiter, (req, res) => {

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

    // 2. Find the account using email
    db.get(
        "SELECT * FROM users WHERE email = ?",
        [cleanEmail],
        async (error, user) => {

            if (error) {
                console.error("Login database error:", error);

                return res.status(500).json({
                    success: false,
                    message: "Unable to process login."
                });
            }

            // 3. Check if account exists
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password."
                });
            }

            try {

                // 4. Compare submitted password with stored hash
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

                // 5. Regenerate session to prevent session fixation
                req.session.regenerate((sessionError) => {

                    if (sessionError) {
                        console.error("Session error:", sessionError);

                        return res.status(500).json({
                            success: false,
                            message: "Unable to create login session."
                        });
                    }

                    // 6. Save authenticated user information
                    req.session.user = {
                        id: user.id,
                        fullName: user.full_name,
                        email: user.email,
                        role: user.role
                    };

                    // 7. Return successful login response
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

            } catch (compareError) {
                console.error("Password comparison error:", compareError);

                return res.status(500).json({
                    success: false,
                    message: "Unable to verify password."
                });
            }

        }
    );

});
// ======================================
// GET /api/auth/me
// Check currently authenticated user
// ======================================

router.get("/me", (req, res) => {

    // Check whether a user is stored in the session
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "You are not logged in."
        });
    }

    // Return the currently authenticated user
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

    // Destroy the session
    req.session.destroy((error) => {

        if (error) {
            console.error("Logout error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to log out."
            });
        }

        // Remove the session cookie from the browser
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