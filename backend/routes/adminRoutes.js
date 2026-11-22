
const express = require("express");
const router = express.Router();

const pool = require("../config/postgres");

const {
    requireAuth,
    requireRole
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


module.exports = router;
