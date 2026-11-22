
const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();

const pool = require("../config/postgres");

const {
    requireAuth,
    requireRole,
    requireAdmin
} = require("../middleware/authMiddleware");



// ======================================
// ADMINISTRATOR DASHBOARD OVERVIEW
// GET /api/admin/overview
// ADMIN ONLY
// ======================================

router.get(
    "/overview",
    requireAuth,
    requireRole("admin"),
    async (req, res) => {

        try {

            // ----------------------------------
            // CASE STATISTICS
            // ----------------------------------

            const casesResult = await pool.query(`
                SELECT
                    COUNT(*) AS total_cases,

                    COUNT(*) FILTER (
                        WHERE status = 'Pending Review'
                    ) AS pending_cases,

                    COUNT(*) FILTER (
                        WHERE status = 'Under Review'
                    ) AS under_review_cases,

                    COUNT(*) FILTER (
                        WHERE status = 'Awaiting Clarification'
                    ) AS awaiting_clarification_cases,

                    COUNT(*) FILTER (
                        WHERE status = 'Ready for Lupon Assessment'
                    ) AS ready_for_lupon_cases,

                    COUNT(*) FILTER (
                        WHERE case_stage IN (
                            'Mediation',
                            'Conciliation',
                            'Arbitration'
                        )
                    ) AS active_proceedings,

                    COUNT(*) FILTER (
                        WHERE case_stage = 'Resolved'
                    ) AS resolved_cases,

                    COUNT(*) FILTER (
                        WHERE case_stage = 'Certificate to File Action'
                    ) AS certificate_to_file_action_cases,

                    COUNT(*) FILTER (
                        WHERE case_stage = 'Closed'
                    ) AS closed_cases

                FROM cases
            `);


            // ----------------------------------
            // STAFF ACCOUNT STATISTICS
            // ----------------------------------

            const staffResult = await pool.query(`
                SELECT
                    COUNT(*) AS total_staff,

                    COUNT(*) FILTER (
                        WHERE role = 'secretary'
                    ) AS secretaries,

                    COUNT(*) FILTER (
                        WHERE role = 'lupon'
                    ) AS lupon_members,

                    COUNT(*) FILTER (
                        WHERE role = 'admin'
                    ) AS administrators

                FROM users
                WHERE role IN ('secretary', 'lupon', 'admin')
            `);


            // ----------------------------------
            // RECENT CASE ACTIVITY
            // ----------------------------------

            const recentCasesResult = await pool.query(`
                SELECT
                    case_number,
                    dispute_type,
                    status,
                    case_stage,
                    created_at,
                    updated_at

                FROM cases

                ORDER BY created_at DESC

                LIMIT 5
            `);


            // ----------------------------------
            // FORMAT DATABASE RESULTS
            // ----------------------------------

            const caseStats = casesResult.rows[0];
            const staffStats = staffResult.rows[0];

            const toNumber = (value) => Number(value || 0);


            // ----------------------------------
            // SEND DASHBOARD DATA
            // ----------------------------------

            return res.status(200).json({

                success: true,

                stats: {

                    cases: {
                        total: toNumber(caseStats.total_cases),
                        pending: toNumber(caseStats.pending_cases),
                        underReview: toNumber(caseStats.under_review_cases),
                        awaitingClarification: toNumber(
                            caseStats.awaiting_clarification_cases
                        ),
                        readyForLupon: toNumber(
                            caseStats.ready_for_lupon_cases
                        ),
                        activeProceedings: toNumber(
                            caseStats.active_proceedings
                        ),
                        resolved: toNumber(caseStats.resolved_cases),
                        certificateToFileAction: toNumber(
                            caseStats.certificate_to_file_action_cases
                        ),
                        closed: toNumber(caseStats.closed_cases)
                    },

                    staff: {
                        total: toNumber(staffStats.total_staff),
                        secretaries: toNumber(staffStats.secretaries),
                        luponMembers: toNumber(staffStats.lupon_members),
                        administrators: toNumber(staffStats.administrators)
                    }

                },

                recentCases: recentCasesResult.rows.map(item => ({

                    caseNumber: item.case_number,
                    disputeType: item.dispute_type,
                    status: item.status,
                    caseStage: item.case_stage,
                    createdAt: item.created_at,
                    updatedAt: item.updated_at

                }))

            });

        } catch (error) {

            console.error(
                "Administrator overview error:",
                error
            );

            return res.status(500).json({

                success: false,
                message: "Unable to load administrator dashboard data."

            });

        }

    }
);


 // ======================================
 // ADMINISTRATOR — USER MANAGEMENT
 // GET /api/admin/users
 // ADMIN ONLY
 // ======================================

router.get(
    "/users",
    requireAuth,
    requireAdmin,
    async (req, res) => {

        try {

            const result = await pool.query(`
                SELECT
                    id,
                    full_name,
                    email,
                    role,
                    created_at
                FROM users
                WHERE role IN ('secretary', 'lupon')
                ORDER BY created_at DESC, full_name ASC
            `);

            const users = result.rows.map(user => ({
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                role: user.role,
                createdAt: user.created_at
            }));

            return res.json({
                success: true,
                users
            });

        } catch (error) {

            console.error(
                "Admin user listing error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve staff accounts."
            });

        }

    }
);


 // ======================================
 // ADMINISTRATOR — CREATE STAFF ACCOUNT
 // POST /api/admin/users
 // ADMIN ONLY
 // ======================================

router.post(
    "/users",
    requireAuth,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                fullName,
                email,
                password,
                role
            } = req.body || {};

            // ----------------------------------
            // VALIDATE FULL NAME
            // ----------------------------------

            if (
                typeof fullName !== "string" ||
                fullName.trim().length < 2 ||
                fullName.trim().length > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Full name must be between 2 and 100 characters."
                });
            }

            // ----------------------------------
            // VALIDATE EMAIL
            // ----------------------------------

            if (typeof email !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "A valid email address is required."
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                normalizedEmail.length > 254 ||
                !emailRegex.test(normalizedEmail)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid email address."
                });
            }

            // ----------------------------------
            // VALIDATE PASSWORD
            // ----------------------------------

            if (
                typeof password !== "string" ||
                password.length < 8 ||
                Buffer.byteLength(password, "utf8") > 72
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Password must contain at least 8 characters and must not exceed 72 bytes."
                });
            }

            // ----------------------------------
            // VALIDATE ROLE
            // ----------------------------------

            if (!["secretary", "lupon"].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: "Only Secretary and Lupon accounts can be created."
                });
            }

            // ----------------------------------
            // CHECK DUPLICATE EMAIL
            // ----------------------------------

            const existingUser = await pool.query(
                `SELECT id FROM users WHERE email = $1`,
                [normalizedEmail]
            );

            if (existingUser.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "An account with this email address already exists."
                });
            }

            // ----------------------------------
            // HASH PASSWORD
            // ----------------------------------

            const hashedPassword = await bcrypt.hash(
                password,
                12
            );

            // ----------------------------------
            // CREATE STAFF ACCOUNT
            // ----------------------------------

            const result = await pool.query(
                `
                INSERT INTO users (
                    full_name,
                    email,
                    password,
                    role
                )
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    full_name,
                    email,
                    role,
                    created_at
                `,
                [
                    fullName.trim(),
                    normalizedEmail,
                    hashedPassword,
                    role
                ]
            );

            const newUser = result.rows[0];

            return res.status(201).json({
                success: true,
                message: "Staff account created successfully.",
                user: {
                    id: newUser.id,
                    fullName: newUser.full_name,
                    email: newUser.email,
                    role: newUser.role,
                    createdAt: newUser.created_at
                }
            });

        } catch (error) {

            // Handle duplicate email race conditions.
            if (error.code === "23505") {
                return res.status(409).json({
                    success: false,
                    message: "An account with this email address already exists."
                });
            }

            console.error(
                "Admin staff account creation error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Unable to create staff account."
            });

        }

    }
);


module.exports = router;
