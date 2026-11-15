
const express = require("express");
const router = express.Router();

const db = require("../config/database");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

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

// GET /api/cases
// Residents see their own cases.
// Secretaries and admins see all cases.
// Lupon members see only assigned cases.
router.get(
    "/",
    requireAuth,
    (req, res) => {
        const user = req.session.user;

        let sql = `
            SELECT cases.*
            FROM cases
        `;

        let params = [];

        if (user.role === "resident") {
            sql += ` WHERE cases.resident_id = ?`;
            params.push(user.id);

        } else if (user.role === "lupon") {
            sql += `
                INNER JOIN case_assignments
                ON cases.id = case_assignments.case_id
                WHERE case_assignments.lupon_user_id = ?
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

        db.all(sql, params, (error, rows) => {
            if (error) {
                console.error("Get cases error:", error.message);

                return res.status(500).json({
                    success: false,
                    message: "Unable to retrieve cases."
                });
            }

            res.json({
                success: true,
                count: rows.length,
                cases: rows.map(formatCase)
            });
        });
    }
);

// POST /api/cases
// Only residents can submit new complaints.
router.post(
    "/",
    requireAuth,
    requireRole("resident"),
    (req, res) => {
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

        const sql = `
            INSERT INTO cases (
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            req.session.user.id,
            cleanComplainant,
            cleanRespondent,
            cleanDisputeType,
            cleanIncidentDetails,
            screeningStatus || null,
            JSON.stringify(screeningReasons || []),
            JSON.stringify(screeningWarnings || []),
            JSON.stringify(screeningAnswers || {})
        ];

        db.run(sql, values, function (error) {
            if (error) {
                console.error("Create case error:", error.message);

                return res.status(500).json({
                    success: false,
                    message: "Unable to save complaint."
                });
            }

            const caseId = this.lastID;
            const caseNumber = `LR-${String(caseId).padStart(5, "0")}`;

            db.run(
                `UPDATE cases SET case_number = ? WHERE id = ?`,
                [caseNumber, caseId],
                (updateError) => {
                    if (updateError) {
                        console.error(
                            "Case number update error:",
                            updateError.message
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Complaint was saved, but its case number could not be generated."
                        });
                    }

                    db.get(
                        `SELECT * FROM cases WHERE id = ?`,
                        [caseId],
                        (getError, row) => {
                            if (getError || !row) {
                                return res.status(500).json({
                                    success: false,
                                    message: "Complaint was saved, but could not be retrieved."
                                });
                            }

                            res.status(201).json({
                                success: true,
                                message: "Complaint submitted successfully.",
                                case: formatCase(row)
                            });
                        }
                    );
                }
            );
        });
    }
);

// GET /api/cases/:id
// Check whether the current user is allowed to view this case.
router.get("/:id", requireAuth, (req, res) => {
    const caseId = Number(req.params.id);

    if (!Number.isInteger(caseId) || caseId < 1) {
        return res.status(400).json({
            success: false,
            message: "Invalid case ID."
        });
    }

    const user = req.session.user;

    const sql = `
        SELECT cases.*
        FROM cases
        WHERE cases.id = ?
        AND (
            cases.resident_id = ?
            OR ? IN ('secretary', 'admin')
            OR EXISTS (
                SELECT 1
                FROM case_assignments
                WHERE case_assignments.case_id = cases.id
                AND case_assignments.lupon_user_id = ?
            )
        )
    `;

    db.get(
        sql,
        [caseId, user.id, user.role, user.id],
        (error, row) => {
            if (error) {
                console.error("Get case details error:", error.message);

                return res.status(500).json({
                    success: false,
                    message: "Unable to retrieve case details."
                });
            }

            if (!row) {
                // Do not reveal whether another user's case exists.
                return res.status(404).json({
                    success: false,
                    message: "Case not found."
                });
            }

            res.json({
                success: true,
                case: formatCase(row)
            });
        }
    );
});

// PATCH /api/cases/:id/status
// Secretary or Admin updates the administrative review status.
router.patch(
    "/:id/status",
    requireAuth,
    requireRole("secretary"),
    (req, res) => {
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

        db.get(
            `SELECT * FROM cases WHERE id = ?`,
            [caseId],
            (error, existingCase) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: "Unable to find case."
                    });
                }

                if (!existingCase) {
                    return res.status(404).json({
                        success: false,
                        message: "Case not found."
                    });
                }

                const history = parseJSON(existingCase.case_history);

                history.push({
                    action: "Administrative status updated",
                    previousStatus: existingCase.status,
                    newStatus: status,
                    notes: secretaryNotes || "",
                    updatedBy: req.session.user.fullName,
                    updatedAt: new Date().toISOString()
                });

                db.run(
                    `UPDATE cases
                     SET status = ?,
                         secretary_notes = ?,
                         case_history = ?,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?`,
                    [
                        status,
                        secretaryNotes || existingCase.secretary_notes || "",
                        JSON.stringify(history),
                        caseId
                    ],
                    function (updateError) {
                        if (updateError) {
                            return res.status(500).json({
                                success: false,
                                message: "Unable to update case status."
                            });
                        }

                        res.json({
                            success: true,
                            message: "Case status updated successfully."
                        });
                    }
                );
            }
        );
    }
);



// PATCH /api/cases/:id/workflow
// Secretary or Admin updates the case workflow stage.
router.patch(
    "/:id/workflow",
    requireAuth,
    requireRole("secretary"),
    (req, res) => {
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

        // Define which stages can follow each current stage.
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

        // Validate case ID.
        if (!Number.isInteger(caseId) || caseId < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid case ID."
            });
        }

        // Validate requested stage.
        if (!allowedStages.includes(caseStage)) {
            return res.status(400).json({
                success: false,
                message: "Invalid workflow stage."
            });
        }

        // Validate arbitration setting.
        if (typeof arbitrationApplicable !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid arbitration setting."
            });
        }

        // Require update notes.
        if (!note || !String(note).trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide workflow update notes."
            });
        }

        // Arbitration must be authorized.
        if (caseStage === "Arbitration" && !arbitrationApplicable) {
            return res.status(400).json({
                success: false,
                message: "Arbitration must be authorized before selecting this stage."
            });
        }

        db.get(
            `SELECT * FROM cases WHERE id = ?`,
            [caseId],
            (error, existingCase) => {
                if (error) {
                    console.error("Workflow lookup error:", error.message);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to retrieve case."
                    });
                }

                if (!existingCase) {
                    return res.status(404).json({
                        success: false,
                        message: "Case not found."
                    });
                }

                // Prevent any further workflow updates after closure.
                if (existingCase.case_stage === "Closed") {
                    return res.status(400).json({
                        success: false,
                        message: "This case is already closed. No further workflow updates are allowed."
                    });
                }

                const previousStage =
                    existingCase.case_stage || "Secretary Review";

                // Resolution and closure must use their dedicated routes.
                        if (
                            caseStage !== previousStage &&
                            ["Resolved", "Closed"].includes(caseStage)
                        ) {
                            return res.status(400).json({
                                success: false,
                                message: "Use the dedicated resolution or closure form to complete this stage."
                            });
                        }


                // Check whether the requested transition is allowed.
                // Saving notes without changing the stage is permitted.
                if (
                    caseStage !== previousStage &&
                    !allowedTransitions[previousStage]?.includes(caseStage)
                ) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot move a case from ${previousStage} to ${caseStage}.`
                    });
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

                db.run(
                    `UPDATE cases
                     SET case_stage = ?,
                         arbitration_applicable = ?,
                         case_history = ?,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?`,
                    [
                        caseStage,
                        arbitrationApplicable ? 1 : 0,
                        JSON.stringify(history),
                        caseId
                    ],
                    function (updateError) {
                        if (updateError) {
                            console.error(
                                "Workflow update error:",
                                updateError.message
                            );

                            return res.status(500).json({
                                success: false,
                                message: "Unable to save workflow update."
                            });
                        }

                        res.json({
                            success: true,
                            message: "Workflow updated successfully.",
                            caseStage,
                            arbitrationApplicable,
                            history
                        });
                    }
                );
            }
        );
    }
);

// PATCH /api/cases/:id/resolution
// Secretary records the final resolution of a case.
router.patch(
    "/:id/resolution",
    requireAuth,
    requireRole("secretary"),
    (req, res) => {
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

        db.get(
            `SELECT * FROM cases WHERE id = ?`,
            [caseId],
            (error, existingCase) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: "Unable to retrieve case."
                    });
                }

                if (!existingCase) {
                    return res.status(404).json({
                        success: false,
                        message: "Case not found."
                    });
                }

                const currentStage =
                    existingCase.case_stage || "Secretary Review";

                const eligibleStages = [
                    "Mediation",
                    "Conciliation",
                    "Arbitration"
                ];

                if (!eligibleStages.includes(currentStage)) {
                    return res.status(400).json({
                        success: false,
                        message: "This case is not currently eligible for resolution recording."
                    });
                }

                if (
                    existingCase.resolution_outcome ||
                    existingCase.resolved_at
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "A resolution has already been recorded for this case."
                    });
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

                db.run(
                    `UPDATE cases
                     SET case_stage = 'Resolved',
                         resolution_outcome = ?,
                         resolution_notes = ?,
                         resolved_at = CURRENT_TIMESTAMP,
                         resolved_by = ?,
                         case_history = ?,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?`,
                    [
                        cleanOutcome,
                        cleanNotes,
                        req.session.user.id,
                        JSON.stringify(history),
                        caseId
                    ],
                    function (updateError) {
                        if (updateError) {
                            console.error(
                                "Resolution update error:",
                                updateError.message
                            );

                            return res.status(500).json({
                                success: false,
                                message: "Unable to record case resolution."
                            });
                        }

                        res.json({
                            success: true,
                            message: "Case resolution recorded successfully.",
                            caseStage: "Resolved"
                        });
                    }
                );
            }
        );
    }
);

// PATCH /api/cases/:id/closure
// Secretary records the administrative closure of a case.
router.patch(
    "/:id/closure",
    requireAuth,
    requireRole("secretary"),
    (req, res) => {
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

        db.get(
            `SELECT * FROM cases WHERE id = ?`,
            [caseId],
            (error, existingCase) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: "Unable to retrieve case."
                    });
                }

                if (!existingCase) {
                    return res.status(404).json({
                        success: false,
                        message: "Case not found."
                    });
                }

                const currentStage =
                    existingCase.case_stage || "Secretary Review";

                const eligibleStages = [
                    "Resolved",
                    "Certificate to File Action"
                ];

                if (!eligibleStages.includes(currentStage)) {
                    return res.status(400).json({
                        success: false,
                        message: "Only resolved or certificate-to-file-action cases can be closed."
                    });
                }

                if (existingCase.closed_at) {
                    return res.status(400).json({
                        success: false,
                        message: "This case has already been closed."
                    });
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

                db.run(
                    `UPDATE cases
                     SET case_stage = 'Closed',
                         closure_notes = ?,
                         closed_at = CURRENT_TIMESTAMP,
                         closed_by = ?,
                         case_history = ?,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?`,
                    [
                        cleanNotes,
                        req.session.user.id,
                        JSON.stringify(history),
                        caseId
                    ],
                    function (updateError) {
                        if (updateError) {
                            console.error(
                                "Case closure error:",
                                updateError.message
                            );

                            return res.status(500).json({
                                success: false,
                                message: "Unable to close case."
                            });
                        }

                        res.json({
                            success: true,
                            message: "Case closed successfully.",
                            caseStage: "Closed"
                        });
                    }
                );
            }
        );
    }
);

// POST /api/cases/:id/assign
// Secretary or Admin assigns a case to a Lupon member.

// POST /api/cases/:id/assign
// Secretary or Admin assigns a case to a Lupon member.
router.post(
    "/:id/assign",
    requireAuth,
    requireRole("secretary"),
    (req, res) => {
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

        db.get(
            `SELECT id FROM cases WHERE id = ?`,
            [caseId],
            (caseError, existingCase) => {
                if (caseError) {
                    console.error("Case lookup error:", caseError.message);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to verify case."
                    });
                }

                if (!existingCase) {
                    return res.status(404).json({
                        success: false,
                        message: "Case not found."
                    });
                }

                db.get(
                    `SELECT id, full_name, role
                     FROM users
                     WHERE id = ?`,
                    [luponUserId],
                    (userError, luponUser) => {
                        if (userError) {
                            console.error("Lupon lookup error:", userError.message);

                            return res.status(500).json({
                                success: false,
                                message: "Unable to verify Lupon member."
                            });
                        }

                        if (!luponUser || luponUser.role !== "lupon") {
                            return res.status(400).json({
                                success: false,
                                message: "The selected account is not a Lupon member."
                            });
                        }

                        db.run(
                            `INSERT INTO case_assignments (
                                case_id,
                                lupon_user_id
                            )
                            VALUES (?, ?)
                            ON CONFLICT(case_id, lupon_user_id) DO NOTHING`,
                            [caseId, luponUserId],
                            function (assignError) {
                                if (assignError) {
                                    console.error(
                                        "ASSIGNMENT DATABASE ERROR:",
                                        assignError.message
                                    );

                                    return res.status(500).json({
                                        success: false,
                                        message: "Unable to assign case."
                                    });
                                }

                                // Capture INSERT result before entering another callback.
                                const assignmentInserted = this.changes > 0;

                                db.get(
                                    `SELECT case_history
                                     FROM cases
                                     WHERE id = ?`,
                                    [caseId],
                                    (historyError, row) => {
                                        if (historyError || !row) {
                                            console.error(
                                                "Assignment history lookup error:",
                                                historyError?.message
                                            );

                                            return res.status(500).json({
                                                success: false,
                                                message: "Assignment saved, but history could not be retrieved."
                                            });
                                        }

                                        const history = parseJSON(row.case_history);

                                        if (assignmentInserted) {
                                            history.push({
                                                action: "Case assigned to Lupon member",
                                                luponUserId: luponUser.id,
                                                luponName: luponUser.full_name,
                                                assignedBy: req.session.user.fullName,
                                                assignedAt: new Date().toISOString()
                                            });
                                        }

                                        db.run(
                                            `UPDATE cases
                                             SET case_history = ?,
                                                 updated_at = CURRENT_TIMESTAMP
                                             WHERE id = ?`,
                                            [JSON.stringify(history), caseId],
                                            (historyUpdateError) => {
                                                if (historyUpdateError) {
                                                    console.error(
                                                        "Assignment history update error:",
                                                        historyUpdateError.message
                                                    );

                                                    return res.status(500).json({
                                                        success: false,
                                                        message: "Assignment saved, but history could not be updated."
                                                    });
                                                }

                                                res.json({
                                                    success: true,
                                                    message: "Case assignment processed.",
                                                    assignedTo: luponUser.full_name
                                                });
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }
);



// POST /api/cases/:id/proceedings
// Assigned Lupon member records a proceeding.
router.post(
    "/:id/proceedings",
    requireAuth,
    requireRole("lupon"),
    (req, res) => {
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

        db.get(
            `SELECT cases.*
             FROM cases
             INNER JOIN case_assignments
                ON cases.id = case_assignments.case_id
             WHERE cases.id = ?
               AND case_assignments.lupon_user_id = ?`,
            [caseId, req.session.user.id],
            (error, existingCase) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: "Unable to verify case assignment."
                    });
                }

                if (!existingCase) {
                    return res.status(403).json({
                        success: false,
                        message: "You are not assigned to this case."
                    });
                }
                // Prevent additional proceedings on completed cases.
                if (
                    ["Resolved", "Certificate to File Action", "Closed"].includes(
                        existingCase.case_stage
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "No additional proceedings can be recorded because this case has reached a terminal stage."
                    });
                }
                if (
                    proceedingType === "Arbitration" &&
                    !existingCase.arbitration_applicable
                ) {
                    return res.status(403).json({
                        success: false,
                        message: "Arbitration has not been authorized for this case."
                    });
                }

                
const proceedings = parseJSON(existingCase.case_proceedings);
const history = parseJSON(existingCase.case_history);

const newProceeding = {
    proceedingType,
    meetingDate,
    attendees: Array.isArray(attendees) ? attendees : [],
    outcome,
    summary,
    nextAction: nextAction || "",
    recordedBy: req.session.user.fullName,
    recordedAt: new Date().toISOString()
};

proceedings.push(newProceeding);

history.push({
    action: `${proceedingType} proceeding recorded`,
    proceedingType,
    recordedBy: req.session.user.fullName,
    recordedAt: new Date().toISOString()
});

// Determine the appropriate workflow stage.
let nextStage = existingCase.case_stage || "Secretary Review";

if (proceedingType === "Mediation") {
    nextStage = "Mediation";
} else if (proceedingType === "Conciliation") {
    nextStage = "Conciliation";
} else if (proceedingType === "Arbitration") {
    nextStage = "Arbitration";
}

// Save the proceeding, history, and workflow stage together.
                db.run(
                    `UPDATE cases
                    SET case_proceedings = ?,
                        case_history = ?,
                        case_stage = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?`,
                    [
                        JSON.stringify(proceedings),
                        JSON.stringify(history),
                        nextStage,
                        caseId
                    ],
                    function (updateError) {
                        if (updateError) {
                            console.error("Save proceeding error:", updateError.message);

                            return res.status(500).json({
                                success: false,
                                message: "Unable to save proceeding."
                            });
                        }

                        res.status(201).json({
                            success: true,
                            message: "Proceeding recorded successfully.",
                            proceeding: newProceeding,
                            caseStage: nextStage
                        });
                    }
                );
            }
        );
    }
);

module.exports = router;
