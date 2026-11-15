
const express = require("express");
const router = express.Router();

const pool = require("../config/postgres");
const {
    requireAuth,
    requireRole
} = require("../middleware/authMiddleware");


// ======================================
// HELPER FUNCTIONS
// ======================================

// Safely convert JSON text into a JavaScript value.
function parseJSON(value, fallback = []) {
    if (!value) return fallback;

    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}


// Convert a database row into a clean case object.
function formatCase(row) {
    return {
        id: row.id,
        caseNumber: row.case_number,
        residentId: row.resident_id,

        complainantName: row.complainant_name,
        respondentName: row.respondent_name,
        disputeType: row.dispute_type,
        incidentDetails: row.incident_details,

        status: row.status,

        screeningStatus: row.screening_status,
        screeningReasons: parseJSON(row.screening_reasons),
        screeningWarnings: parseJSON(row.screening_warnings),
        screeningAnswers: parseJSON(row.screening_answers, {}),

        secretaryNotes: row.secretary_notes,
        caseStage: row.case_stage,
        arbitrationApplicable: Boolean(row.arbitration_applicable),

        caseHistory: parseJSON(row.case_history),
        caseProceedings: parseJSON(row.case_proceedings),

        resolutionOutcome: row.resolution_outcome,
        resolutionNotes: row.resolution_notes,
        resolvedAt: row.resolved_at,
        resolvedBy: row.resolved_by,

        closureNotes: row.closure_notes,
        closedAt: row.closed_at,
        closedBy: row.closed_by,

        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}


// Execute multiple database operations as one transaction.
async function withTransaction(callback) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await callback(client);

        await client.query("COMMIT");

        return result;

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
}


// ======================================
// GET ALL CASES
// ======================================

// Residents see their own cases.
// Secretaries and admins see all cases.
// Lupon members see only assigned cases.

router.get(
    "/",
    requireAuth,
    async (req, res) => {

        try {
            const user = req.session.user;

            let sql = `
                SELECT cases.*
                FROM cases
            `;

            const params = [];

            if (user.role === "resident") {
                sql += ` WHERE cases.resident_id = $1`;
                params.push(user.id);

            } else if (user.role === "lupon") {
                sql += `
                    INNER JOIN case_assignments
                    ON cases.id = case_assignments.case_id
                    WHERE case_assignments.lupon_user_id = $1
                `;
                params.push(user.id);

            } else if (
                user.role !== "secretary" &&
                user.role !== "admin"
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to view cases."
                });
            }

            sql += ` ORDER BY cases.created_at DESC`;

            const result = await pool.query(sql, params);

            res.json({
                success: true,
                count: result.rows.length,
                cases: result.rows.map(formatCase)
            });

        } catch (error) {
            console.error("Get cases error:", error);

            res.status(500).json({
                success: false,
                message: "Unable to retrieve cases."
            });
        }
    }
);


// ======================================
// SUBMIT NEW COMPLAINT
// ======================================

// Only residents can submit new complaints.

router.post(
    "/",
    requireAuth,
    requireRole("resident"),
    async (req, res) => {

        try {
            const {
                complainantName,
                respondentName,
                disputeType,
                incidentDetails,
                screeningStatus,
                screeningReasons,
                screeningWarnings,
                screeningAnswers
            } = req.body;

            if (
                !complainantName ||
                !respondentName ||
                !disputeType ||
                !incidentDetails
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide all required complaint information."
                });
            }

            const cleanComplainant = String(complainantName).trim();
            const cleanRespondent = String(respondentName).trim();
            const cleanDisputeType = String(disputeType).trim();
            const cleanIncidentDetails = String(incidentDetails).trim();

            if (
                !cleanComplainant ||
                !cleanRespondent ||
                !cleanDisputeType ||
                !cleanIncidentDetails
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Complaint fields cannot be empty."
                });
            }

            if (
                cleanComplainant.length > 150 ||
                cleanRespondent.length > 150 ||
                cleanDisputeType.length > 100 ||
                cleanIncidentDetails.length > 10000
            ) {
                return res.status(400).json({
                    success: false,
                    message: "One or more complaint fields are too long."
                });
            }

            const newCase = await withTransaction(async (client) => {

                const insertResult = await client.query(
                    `INSERT INTO cases (
                        resident_id,
                        complainant_name,
                        respondent_name,
                        dispute_type,
                        incident_details,
                        screening_status,
                        screening_reasons,
                        screening_warnings,
                        screening_answers
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING id`,
                    [
                        req.session.user.id,
                        cleanComplainant,
                        cleanRespondent,
                        cleanDisputeType,
                        cleanIncidentDetails,
                        screeningStatus || null,
                        JSON.stringify(screeningReasons || []),
                        JSON.stringify(screeningWarnings || []),
                        JSON.stringify(screeningAnswers || {})
                    ]
                );

                const caseId = insertResult.rows[0].id;

                const caseNumber =
                    `LR-${String(caseId).padStart(5, "0")}`;

                await client.query(
                    `UPDATE cases
                     SET case_number = $1
                     WHERE id = $2`,
                    [caseNumber, caseId]
                );

                const caseResult = await client.query(
                    `SELECT *
                     FROM cases
                     WHERE id = $1`,
                    [caseId]
                );

                return caseResult.rows[0];
            });

            res.status(201).json({
                success: true,
                message: "Complaint submitted successfully.",
                case: formatCase(newCase)
            });

        } catch (error) {
            console.error("Create case error:", error);

            res.status(500).json({
                success: false,
                message: "Unable to save complaint."
            });
        }
    }
);


// ======================================
// GET CASE DETAILS
// ======================================

// Check whether the current user is allowed to view this case.

router.get(
    "/:id",
    requireAuth,
    async (req, res) => {

        try {
            const caseId = Number(req.params.id);

            if (!Number.isInteger(caseId) || caseId < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid case ID."
                });
            }

            const user = req.session.user;

            const result = await pool.query(
                `SELECT cases.*
                 FROM cases
                 WHERE cases.id = $1
                 AND (
                     cases.resident_id = $2
                     OR $3 IN ('secretary', 'admin')
                     OR EXISTS (
                         SELECT 1
                         FROM case_assignments
                         WHERE case_assignments.case_id = cases.id
                         AND case_assignments.lupon_user_id = $4
                     )
                 )`,
                [caseId, user.id, user.role, user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Case not found."
                });
            }

            res.json({
                success: true,
                case: formatCase(result.rows[0])
            });

        } catch (error) {
            console.error("Get case details error:", error);

            res.status(500).json({
                success: false,
                message: "Unable to retrieve case details."
            });
        }
    }
);


// ======================================
// UPDATE ADMINISTRATIVE STATUS
// ======================================

// Secretary updates the administrative review status.

router.patch(
    "/:id/status",
    requireAuth,
    requireRole("secretary"),
    async (req, res) => {

        try {
            const caseId = Number(req.params.id);
            const { status, secretaryNotes } = req.body;

            const allowedStatuses = [
                "Pending Review",
                "Under Review",
                "Awaiting Clarification",
                "Ready for Lupon Assessment"
            ];

            if (!Number.isInteger(caseId) || caseId < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid case ID."
                });
            }

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid administrative status."
                });
            }

            const updated = await withTransaction(async (client) => {

                const lookup = await client.query(
                    `SELECT *
                     FROM cases
                     WHERE id = $1
                     FOR UPDATE`,
                    [caseId]
                );

                if (lookup.rows.length === 0) {
                    return false;
                }

                const existingCase = lookup.rows[0];
                const history = parseJSON(existingCase.case_history);

                history.push({
                    action: "Administrative status updated",
                    previousStatus: existingCase.status,
                    newStatus: status,
                    notes: secretaryNotes || "",
                    updatedBy: req.session.user.fullName,
                    updatedAt: new Date().toISOString()
                });

                await client.query(
                    `UPDATE cases
                     SET status = $1,
                         secretary_notes = $2,
                         case_history = $3,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $4`,
                    [
                        status,
                        secretaryNotes || existingCase.secretary_notes || "",
                        JSON.stringify(history),
                        caseId
                    ]
                );

                return true;
            });

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: "Case not found."
                });
            }

            res.json({
                success: true,
                message: "Case status updated successfully."
            });

        } catch (error) {
            console.error("Update case status error:", error);

            res.status(500).json({
                success: false,
                message: "Unable to update case status."
            });
        }
    }
);


// ======================================
// UPDATE CASE WORKFLOW
// ======================================

router.patch(
    "/:id/workflow",
    requireAuth,
    requireRole("secretary"),
    async (req, res) => {

        try {
            const caseId = Number(req.params.id);

            const {
                caseStage,
                arbitrationApplicable,
                note
            } = req.body;

            const allowedStages = [
                "Secretary Review",
                "For Lupon Assessment",
                "Mediation",
                "Conciliation",
                "Arbitration",
                "Resolved",
                "Certificate to File Action",
                "Closed"
            ];

            const allowedTransitions = {
                "Secretary Review": [
                    "For Lupon Assessment"
                ],

                "For Lupon Assessment": [
                    "Mediation",
                    "Conciliation",
                    "Arbitration"
                ],

                "Mediation": [
                    "Conciliation",
                    "Resolved",
                    "Certificate to File Action"
                ],

                "Conciliation": [
                    "Arbitration",
                    "Resolved",
                    "Certificate to File Action"
                ],

                "Arbitration": [
                    "Resolved",
                    "Certificate to File Action"
                ],

                "Resolved": [
                    "Closed"
                ],

                "Certificate to File Action": [
                    "Closed"
                ],

                "Closed": []
            };

            if (!Number.isInteger(caseId) || caseId < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid case ID."
                });
            }

            if (!allowedStages.includes(caseStage)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid workflow stage."
                });
            }

            if (typeof arbitrationApplicable !== "boolean") {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid arbitration setting."
                });
            }

            if (!note || !String(note).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide workflow update notes."
                });
            }

            if (caseStage === "Arbitration" && !arbitrationApplicable) {
                return res.status(400).json({
                    success: false,
                    message: "Arbitration must be authorized before selecting this stage."
                });
            }

            const result = await withTransaction(async (client) => {

                const lookup = await client.query(
                    `SELECT *
                     FROM cases
                     WHERE id = $1
                     FOR UPDATE`,
                    [caseId]
                );

                if (lookup.rows.length === 0) {
                    return { notFound: true };
                }

                const existingCase = lookup.rows[0];

                if (existingCase.case_stage === "Closed") {
                    return {
                        error: "This case is already closed. No further workflow updates are allowed."
                    };
                }

                const previousStage =
                    existingCase.case_stage || "Secretary Review";

                if (
                    caseStage !== previousStage &&
                    ["Resolved", "Closed"].includes(caseStage)
                ) {
                    return {
                        error: "Use the dedicated resolution or closure form to complete this stage."
                    };
                }

                if (
                    caseStage !== previousStage &&
                    !allowedTransitions[previousStage]?.includes(caseStage)
                ) {
                    return {
                        error: `Cannot move a case from ${previousStage} to ${caseStage}.`
                    };
                }

                const history = parseJSON(existingCase.case_history);
                const recordedAt = new Date().toISOString();

                history.push({
                    action: "Workflow stage updated",
                    previousStage,
                    stage: caseStage,
                    note: String(note).trim(),
                    date: recordedAt,
                    updatedBy: req.session.user.fullName
                });

                await client.query(
                    `UPDATE cases
                     SET case_stage = $1,
                         arbitration_applicable = $2,
                         case_history = $3,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $4`,
                    [
                        caseStage,
                        arbitrationApplicable ? 1 : 0,
                        JSON.stringify(history),
                        caseId
                    ]
                );

                return {
                    caseStage,
                    arbitrationApplicable,
                    history
                };
            });

            if (result.notFound) {
                return res.status(404).json({
                    success: false,
                    message: "Case not found."
                });
            }

            if (result.error) {
                return res.status(400).json({
                    success: false,
                    message: result.error
                });
            }

            res.json({
                success: true,
                message: "Workflow updated successfully.",
                caseStage: result.caseStage,
                arbitrationApplicable: result.arbitrationApplicable,
                history: result.history
            });

        } catch (error) {
            console.error("Workflow update error:", error);

            res.status(500).json({
                success: false,
                message: "Unable to save workflow update."
            });
        }
    }
);


// ======================================
// RECORD CASE RESOLUTION
// ======================================

router.patch(
    "/:id/resolution",
    requireAuth,
    requireRole("secretary"),
    async (req, res) => {

        try {
            const caseId = Number(req.params.id);

            const { resolutionOutcome, resolutionNotes } = req.body;

            if (!Number.isInteger(caseId) || caseId < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid case ID."
                });
            }

            const cleanOutcome = String(resolutionOutcome || "").trim();
            const cleanNotes = String(resolutionNotes || "").trim();

            if (!cleanOutcome || !cleanNotes) {
                return res.status(400).json({
                    success: false,
                    message: "Resolution outcome and notes are required."
                });
            }

            if (cleanOutcome.length > 100 || cleanNotes.length > 10000) {
                return res.status(400).json({
                    success: false,
                    message: "Resolution information is too long."
                });
            }

            const result = await withTransaction(async (client) => {

                const lookup = await client.query(
                    `SELECT *
                     FROM cases
                     WHERE id = $1
                     FOR UPDATE`,
                    [caseId]
                );

                if (lookup.rows.length === 0) {
                    return { notFound: true };
                }

                const existingCase = lookup.rows[0];

                const currentStage =
                    existingCase.case_stage || "Secretary Review";

                const eligibleStages = [
                    "Mediation",
                    "Conciliation",
                    "Arbitration"
                ];

                if (!eligibleStages.includes(currentStage)) {
                    return {
                        error: "This case is not currently eligible for resolution recording."
                    };
                }

                if (
                    existingCase.resolution_outcome ||
                    existingCase.resolved_at
                ) {
                    return {
                        error: "A resolution has already been recorded for this case."
                    };
                }

                const history = parseJSON(existingCase.case_history);
                const recordedAt = new Date().toISOString();

                history.push({
                    action: "Case resolution recorded",
                    previousStage: currentStage,
                    stage: "Resolved",
                    resolutionOutcome: cleanOutcome,
                    notes: cleanNotes,
                    recordedBy: req.session.user.fullName,
                    recordedAt
                });

                await client.query(
                    `UPDATE cases
                     SET case_stage = 'Resolved',
                         resolution_outcome = $1,
                         resolution_notes = $2,
                         resolved_at = CURRENT_TIMESTAMP,
                         resolved_by = $3,
                         case_history = $4,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $5`,
                    [
                        cleanOutcome,
                        cleanNotes,
                        req.session.user.id,
                        JSON.stringify(history),
                        caseId
                    ]
                );

                return { success: true };
            });

            if (result.notFound) {
                return res.status(404).json({
                    success: false,
                    message: "Case not found."
                });
            }

            if (result.error) {
                return res.status(400).json({
                    success: false,
                    message: result.error
                });
            }

            res.json({
                success: true,
                message: "Case resolution recorded successfully.",
                caseStage: "Resolved"
            });

        } catch (error) {
            console.error("Resolution update error:", error);

            res.status(500).json({
                success: false,
                message: "Unable to record case resolution."
            });
        }
    }
);


// ======================================
// CLOSE CASE
// ======================================

router.patch(
    "/:id/closure",
    requireAuth,
    requireRole("secretary"),
    async (req, res) => {

        try {
            const caseId = Number(req.params.id);
            const { closureNotes } = req.body;

            if (!Number.isInteger(caseId) || caseId < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid case ID."
                });
            }

            const cleanNotes = String(closureNotes || "").trim();

            if (!cleanNotes) {
                return res.status(400).json({
                    success: false,
                    message: "Closure notes are required."
                });
            }

            if (cleanNotes.length > 10000) {
                return res.status(400).json({
                    success: false,
                    message: "Closure notes are too long."
                });
            }

            const result = await withTransaction(async (client) => {

                const lookup = await client.query(
                    `SELECT *
                     FROM cases
                     WHERE id = $1
                     FOR UPDATE`,
                    [caseId]
                );

                if (lookup.rows.length === 0) {
                    return { notFound: true };
                }

                const existingCase = lookup.rows[0];

                const currentStage =
                    existingCase.case_stage || "Secretary Review";

                const eligibleStages = [
                    "Resolved",
                    "Certificate to File Action"
                ];

                if (!eligibleStages.includes(currentStage)) {
                    return {
                        error: "Only resolved or certificate-to-file-action cases can be closed."
                    };
                }

                if (existingCase.closed_at) {
                    return {
                        error: "This case has already been closed."
                    };
                }

                const history = parseJSON(existingCase.case_history);
                const recordedAt = new Date().toISOString();

                history.push({
                    action: "Case closed",
                    previousStage: currentStage,
                    stage: "Closed",
                    notes: cleanNotes,
                    closedBy: req.session.user.fullName,
                    closedAt: recordedAt
                });

                await client.query(
                    `UPDATE cases
                     SET case_stage = 'Closed',
                         closure_notes = $1,
                         closed_at = CURRENT_TIMESTAMP,
                         closed_by = $2,
                         case_history = $3,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $4`,
                    [
                        cleanNotes,
                        req.session.user.id,
                        JSON.stringify(history),
                        caseId
                    ]
                );

                return { success: true };
            });

            if (result.notFound) {
                return res.status(404).json({
                    success: false,
                    message: "Case not found."
                });
            }

            if (result.error) {
                return res.status(400).json({
                    success: false,
                    message: result.error
                });
            }

            res.json({
                success: true,
                message: "Case closed successfully.",
                caseStage: "Closed"
            });

        } catch (error) {
            console.error("Case closure error:", error);

            res.status(500).json({
                success: false,
                message: "Unable to close case."
            });
        }
    }
);


// ======================================
// ASSIGN CASE TO LUPON MEMBER
// ======================================

router.post(
    "/:id/assign",
    requireAuth,
    requireRole("secretary"),
    async (req, res) => {

        try {
            const caseId = Number(req.params.id);
            const luponUserId = Number(req.body.luponUserId);

            if (
                !Number.isInteger(caseId) ||
                caseId < 1 ||
                !Number.isInteger(luponUserId) ||
                luponUserId < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: "A valid case ID and Lupon member ID are required."
                });
            }

            const result = await withTransaction(async (client) => {

                const caseResult = await client.query(
                    `SELECT id
                     FROM cases
                     WHERE id = $1`,
                    [caseId]
                );

                if (caseResult.rows.length === 0) {
                    return { caseNotFound: true };
                }

                const userResult = await client.query(
                    `SELECT id, full_name, role
                     FROM users
                     WHERE id = $1`,
                    [luponUserId]
                );

                const luponUser = userResult.rows[0];

                if (!luponUser || luponUser.role !== "lupon") {
                    return { invalidUser: true };
                }

                const assignment = await client.query(
                    `INSERT INTO case_assignments (
                        case_id,
                        lupon_user_id
                    )
                    VALUES ($1, $2)
                    ON CONFLICT (case_id, lupon_user_id)
                    DO NOTHING
                    RETURNING id`,
                    [caseId, luponUserId]
                );

                const assignmentInserted = assignment.rowCount > 0;

                const historyResult = await client.query(
                    `SELECT case_history
                     FROM cases
                     WHERE id = $1
                     FOR UPDATE`,
                    [caseId]
                );

                const history = parseJSON(
                    historyResult.rows[0].case_history
                );

                if (assignmentInserted) {
                    history.push({
                        action: "Case assigned to Lupon member",
                        luponUserId: luponUser.id,
                        luponName: luponUser.full_name,
                        assignedBy: req.session.user.fullName,
                        assignedAt: new Date().toISOString()
                    });

                    await client.query(
                        `UPDATE cases
                         SET case_history = $1,
                             updated_at = CURRENT_TIMESTAMP
                         WHERE id = $2`,
                        [JSON.stringify(history), caseId]
                    );
                }

                return {
                    assignedTo: luponUser.full_name
                };
            });

            if (result.caseNotFound) {
                return res.status(404).json({
                    success: false,
                    message: "Case not found."
                });
            }

            if (result.invalidUser) {
                return res.status(400).json({
                    success: false,
                    message: "The selected account is not a Lupon member."
                });
            }

            res.json({
                success: true,
                message: "Case assignment processed.",
                assignedTo: result.assignedTo
            });

        } catch (error) {
            console.error("Assignment database error:", error);

            res.status(500).json({
                success: false,
                message: "Unable to assign case."
            });
        }
    }
);


// ======================================
// RECORD CASE PROCEEDINGS
// ======================================

// Assigned Lupon member records a proceeding.

router.post(
    "/:id/proceedings",
    requireAuth,
    requireRole("lupon"),
    async (req, res) => {

        try {
            const caseId = Number(req.params.id);

            const {
                proceedingType,
                meetingDate,
                attendees,
                outcome,
                summary,
                nextAction
            } = req.body;

            const allowedTypes = [
                "Mediation",
                "Conciliation",
                "Arbitration"
            ];

            if (!Number.isInteger(caseId) || caseId < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid case ID."
                });
            }

            if (
                !allowedTypes.includes(proceedingType) ||
                !meetingDate ||
                !outcome ||
                !summary
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid proceeding type, meeting date, outcome, and summary."
                });
            }

            const result = await withTransaction(async (client) => {

                const lookup = await client.query(
                    `SELECT cases.*
                     FROM cases
                     INNER JOIN case_assignments
                        ON cases.id = case_assignments.case_id
                     WHERE cases.id = $1
                       AND case_assignments.lupon_user_id = $2
                     FOR UPDATE OF cases`,
                    [caseId, req.session.user.id]
                );

                if (lookup.rows.length === 0) {
                    return { notAssigned: true };
                }

                const existingCase = lookup.rows[0];

                if (
                    [
                        "Resolved",
                        "Certificate to File Action",
                        "Closed"
                    ].includes(existingCase.case_stage)
                ) {
                    return {
                        error: "No additional proceedings can be recorded because this case has reached a terminal stage."
                    };
                }

                if (
                    proceedingType === "Arbitration" &&
                    !existingCase.arbitration_applicable
                ) {
                    return {
                        forbidden: true
                    };
                }

                const proceedings = parseJSON(
                    existingCase.case_proceedings
                );

                const history = parseJSON(
                    existingCase.case_history
                );

                const recordedAt = new Date().toISOString();

                const newProceeding = {
                    proceedingType,
                    meetingDate,
                    attendees: Array.isArray(attendees) ? attendees : [],
                    outcome,
                    summary,
                    nextAction: nextAction || "",
                    recordedBy: req.session.user.fullName,
                    recordedAt
                };

                proceedings.push(newProceeding);

                history.push({
                    action: `${proceedingType} proceeding recorded`,
                    proceedingType,
                    recordedBy: req.session.user.fullName,
                    recordedAt
                });

                let nextStage =
                    existingCase.case_stage || "Secretary Review";

                if (proceedingType === "Mediation") {
                    nextStage = "Mediation";
                } else if (proceedingType === "Conciliation") {
                    nextStage = "Conciliation";
                } else if (proceedingType === "Arbitration") {
                    nextStage = "Arbitration";
                }

                await client.query(
                    `UPDATE cases
                     SET case_proceedings = $1,
                         case_history = $2,
                         case_stage = $3,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $4`,
                    [
                        JSON.stringify(proceedings),
                        JSON.stringify(history),
                        nextStage,
                        caseId
                    ]
                );

                return {
                    proceeding: newProceeding,
                    caseStage: nextStage
                };
            });

            if (result.notAssigned) {
                return res.status(403).json({
                    success: false,
                    message: "You are not assigned to this case."
                });
            }

            if (result.forbidden) {
                return res.status(403).json({
                    success: false,
                    message: "Arbitration has not been authorized for this case."
                });
            }

            if (result.error) {
                return res.status(400).json({
                    success: false,
                    message: result.error
                });
            }

            res.status(201).json({
                success: true,
                message: "Proceeding recorded successfully.",
                proceeding: result.proceeding,
                caseStage: result.caseStage
            });

        } catch (error) {
            console.error("Save proceeding error:", error);

            res.status(500).json({
                success: false,
                message: "Unable to save proceeding."
            });
        }
    }
);


module.exports = router;
