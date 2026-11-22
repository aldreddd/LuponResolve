
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { rateLimit } = require("express-rate-limit");
const screenComplaint = require("../utils/complaintScreening");

const pool = require("../config/postgres");
const {
    requireAuth,
    requireRole
} = require("../middleware/authMiddleware");

// ======================================
// GUEST COMPLAINT RATE LIMITER
// ======================================

const guestComplaintLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Maximum 5 submissions
    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many complaint submissions. Please try again after 15 minutes."
    }
});
// Limit repeated public tracking attempts.
const publicTrackingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many tracking attempts. Please try again later."
    }
});
// ======================================
// HELPER FUNCTIONS
// ======================================

// Generate a secure public case tracking code.
function generateTrackingCode() {
    return crypto.randomBytes(32).toString("hex");
}

// Hash the tracking code before storing it in the database.
function hashTrackingCode(code) {
    return crypto.createHash("sha256").update(code).digest("hex");
}
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
        complainantContact: row.complainant_contact,
        respondentName: row.respondent_name,
        respondentAddress: row.respondent_address,
        respondentEmail: row.respondent_email,
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
// ======================================
// PUBLIC GUEST COMPLAINT SUBMISSION
// ======================================
// ======================================
// PUBLIC CASE TRACKING
// ======================================

router.post("/track", publicTrackingLimiter, async (req, res) => {
    try {
        const caseNumber = String(req.body.caseNumber || "")
            .trim()
            .toUpperCase();

        const trackingCode = String(req.body.trackingCode || "")
            .trim();

        // Basic input validation
        if (!caseNumber || !trackingCode) {
            return res.status(400).json({
                success: false,
                message: "Case number and tracking code are required."
            });
        }

        // Tracking codes generated by our system are 64 hex characters.
        if (!/^[a-f0-9]{64}$/i.test(trackingCode)) {
            return res.status(404).json({
                success: false,
                message: "Invalid case number or tracking code."
            });
        }

        // Hash the supplied code before comparing it to the stored hash.
        const submittedHash = hashTrackingCode(trackingCode);

        const result = await pool.query(
            `
            SELECT
                case_number,
                tracking_code_hash,
                status,
                case_stage,
                created_at,
                updated_at
            FROM cases
            WHERE case_number = $1
            LIMIT 1
            `,
            [caseNumber]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Invalid case number or tracking code."
            });
        }

        const storedHash = result.rows[0].tracking_code_hash;

        if (
            !storedHash ||
            !/^[a-f0-9]{64}$/i.test(storedHash) ||
            !crypto.timingSafeEqual(
                Buffer.from(submittedHash, "hex"),
                Buffer.from(storedHash, "hex")
            )
        ) {
            return res.status(404).json({
                success: false,
                message: "Invalid case number or tracking code."
            });
        }

        // Return only information safe for public viewing.
        return res.json({
            success: true,
            case: {
                caseNumber: result.rows[0].case_number,
                status: result.rows[0].status,
                caseStage: result.rows[0].case_stage,
                dateSubmitted: result.rows[0].created_at,
                lastUpdated: result.rows[0].updated_at
            }
        });

    } catch (error) {
        console.error("Public case tracking error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to track your case at this time."
        });
    }
});
router.post("/guest", guestComplaintLimiter, async (req, res) => {
        // Honeypot anti-spam check
    if (req.body.companyWebsite) {
        return res.status(400).json({
            success: false,
            message: "Invalid submission."
        });
    }
    const {
        complainantName,
        complainantContact,
        respondentName,
        respondentAddress,
        respondentEmail,
        disputeType,
        incidentDetails,
        screeningAnswers
    } = req.body;

    // ----------------------------------
    // VALIDATE REQUIRED FIELDS
    // ----------------------------------

    if (
        typeof complainantName !== "string" ||
        typeof complainantContact !== "string" ||
        typeof respondentName !== "string" ||
        typeof disputeType !== "string" ||
        typeof incidentDetails !== "string" ||
        !screeningAnswers ||
        typeof screeningAnswers !== "object" ||
        Array.isArray(screeningAnswers)
    ) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required complaint information."
        });
    }
    // ----------------------------------
    // NORMALIZE OPTIONAL FIELDS
    // ----------------------------------

    if (
        (respondentAddress != null && typeof respondentAddress !== "string") ||
        (respondentEmail != null && typeof respondentEmail !== "string")
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid respondent contact information."
        });
    }

    const cleanRespondentAddress = (respondentAddress || "").trim();
    const cleanRespondentEmail = (respondentEmail || "").trim().toLowerCase();

    if (
        cleanRespondentEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanRespondentEmail)
    ) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid respondent email address."
        });
    }
    // ----------------------------------
    // VALIDATE TEXT LENGTHS
    // ----------------------------------

    if (
        complainantName.trim().length > 150 ||
        complainantContact.trim().length > 50 ||
        respondentName.trim().length > 150 ||
        cleanRespondentAddress.length > 500 ||
        cleanRespondentEmail.length > 254 ||
        disputeType.trim().length > 100 ||
        incidentDetails.trim().length > 10000
    ) {
        return res.status(400).json({
            success: false,
            message: "One or more fields exceed the allowed length."
        });
    }

    if (
        !complainantName.trim() ||
        !complainantContact.trim() ||
        !respondentName.trim() ||
        !disputeType.trim() ||
        !incidentDetails.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "Required fields cannot be empty."
        });
    }

    // ----------------------------------
    // VALIDATE SCREENING ANSWERS
    // ----------------------------------

    const requiredAnswerKeys = [
        "complainantMunicipality",
        "complainantBarangay",
        "respondentMunicipality",
        "respondentBarangay",
        "governmentParty",
        "publicOfficial",
        "criminalOffense",
        "penaltyThreshold",
        "privateOffendedParty",
        "realPropertyDispute",
        "propertyDifferentCities",
        "propertyPartiesAgree",
        "barangaysAdjoining",
        "partiesAgree",
        "otherException"
    ];

    const freeTextAnswerKeys = [
        "complainantMunicipality",
        "complainantBarangay",
        "respondentMunicipality",
        "respondentBarangay"
    ];

    const allowedAnswerValues = [
        "yes",
        "no",
        "unsure",
        "not_applicable"
    ];

    for (const key of requiredAnswerKeys) {

        const answer = screeningAnswers[key];

        if (
            typeof answer !== "string" ||
            !answer.trim() ||
            answer.length > 200
        ) {
            return res.status(400).json({
                success: false,
                message: `Invalid or missing screening answer: ${key}`
            });
        }

        if (
            !freeTextAnswerKeys.includes(key) &&
            !allowedAnswerValues.includes(answer)
        ) {
            return res.status(400).json({
                success: false,
                message: `Invalid screening selection: ${key}`
            });
        }
    }

    // ----------------------------------
    // SERVER-SIDE SCREENING
    // Never trust screening results from
    // the user's browser.
    // ----------------------------------

    const screening = screenComplaint(screeningAnswers);
    // Generate a one-time tracking secret for the resident.
    const trackingCode = generateTrackingCode();
    const trackingCodeHash = hashTrackingCode(trackingCode);
    // ----------------------------------
    // SAVE TO DATABASE
    // ----------------------------------

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const insertResult = await client.query(
            `
            INSERT INTO cases (
                resident_id,
                complainant_name,
                complainant_contact,
                respondent_name,
                respondent_address,
                respondent_email,
                dispute_type,
                incident_details,
                status,
                screening_status,
                screening_reasons,
                screening_warnings,
                screening_answers,
                tracking_code_hash,
                case_stage
            )
            VALUES (
                NULL,
                $1, $2, $3, $4, $5, $6, $7,
                'Pending Review',
                $8, $9, $10, $11, $12,
                'Secretary Review'
            )
            RETURNING id
            `,
            [
                complainantName.trim(),
                complainantContact.trim(),
                respondentName.trim(),
                cleanRespondentAddress || null,
                cleanRespondentEmail || null,
                disputeType.trim(),
                incidentDetails.trim(),
                screening.status,
                JSON.stringify(screening.reasons),
                JSON.stringify(screening.warnings),
                JSON.stringify(screeningAnswers),
                trackingCodeHash
            ]
        );

        const caseId = insertResult.rows[0].id;

        const caseNumber = `LR-${String(caseId).padStart(5, "0")}`;

        await client.query(
            `
            UPDATE cases
            SET case_number = $1
            WHERE id = $2
            `,
            [caseNumber, caseId]
        );

        await client.query("COMMIT");

        return res.status(201).json({
            success: true,
            message: "Complaint submitted successfully.",
            caseNumber,
            trackingCode,
            screeningStatus: screening.status
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error("Guest complaint submission error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to submit complaint at this time."
        });

    } finally {

        client.release();

    }

});
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
                respondentAddress,
                respondentEmail,
                disputeType,
                incidentDetails,
                screeningStatus,
                screeningReasons,
                screeningWarnings,
                screeningAnswers
            } = req.body;
            const cleanRespondentAddress =
                String(respondentAddress || "").trim();

            const cleanRespondentEmail =
                String(respondentEmail || "").trim().toLowerCase();

            // Validate optional respondent email.
            if (
                cleanRespondentEmail &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanRespondentEmail)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid respondent email address."
                });
            }

            if (
                cleanRespondentAddress.length > 500 ||
                cleanRespondentEmail.length > 254
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Respondent contact information is too long."
                });
            }
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
                        respondent_address,
                        respondent_email,
                        dispute_type,
                        incident_details,
                        screening_status,
                        screening_reasons,
                        screening_warnings,
                        screening_answers
                    )
                    VALUES (
                        $1, $2, $3, $4, $5, $6,
                        $7, $8, $9, $10, $11
                    )
                    RETURNING id`,
                    [
                        req.session.user.id,
                        cleanComplainant,
                        cleanRespondent,
                        cleanRespondentAddress || null,
                        cleanRespondentEmail || null,
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


// ======================================
// ADMINISTRATOR — CASE OVERSIGHT
// GET /api/admin/cases
// ADMIN ONLY
// ======================================

router.get(
    "/cases",
    requireAuth,
    requireRole("admin"),
    async (req, res) => {

        try {

            // ----------------------------------
            // PAGINATION
            // ----------------------------------

            const page = Number.parseInt(req.query.page, 10) || 1;
            const limit = Number.parseInt(req.query.limit, 10) || 10;

            if (
                !Number.isInteger(page) ||
                page < 1 ||
                !Number.isInteger(limit) ||
                limit < 1 ||
                limit > 50
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid pagination settings."
                });
            }

            const offset = (page - 1) * limit;


            // ----------------------------------
            // SEARCH
            // ----------------------------------

            const search = typeof req.query.search === "string"
                ? req.query.search.trim()
                : "";

            if (search.length > 100) {
                return res.status(400).json({
                    success: false,
                    message: "Search text must not exceed 100 characters."
                });
            }


            // ----------------------------------
            // FILTER VALIDATION
            // ----------------------------------

            const allowedStatuses = [
                "Pending Review",
                "Under Review",
                "Awaiting Clarification",
                "Ready for Lupon Assessment"
            ];

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

            const status = typeof req.query.status === "string"
                ? req.query.status.trim()
                : "";

            const caseStage = typeof req.query.caseStage === "string"
                ? req.query.caseStage.trim()
                : "";

            if (status && !allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid case status filter."
                });
            }

            if (caseStage && !allowedStages.includes(caseStage)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid workflow stage filter."
                });
            }


            // ----------------------------------
            // BUILD FILTER CONDITIONS
            // ----------------------------------

            const conditions = [];
            const params = [];

            if (search) {

                params.push(`%${search}%`);

                const searchIndex = params.length;

                conditions.push(`
                    (
                        case_number ILIKE $${searchIndex}
                        OR complainant_name ILIKE $${searchIndex}
                        OR respondent_name ILIKE $${searchIndex}
                        OR dispute_type ILIKE $${searchIndex}
                    )
                `);

            }

            if (status) {

                params.push(status);

                conditions.push(
                    `status = $${params.length}`
                );

            }

            if (caseStage) {

                params.push(caseStage);

                conditions.push(
                    `case_stage = $${params.length}`
                );

            }

            const whereClause = conditions.length
                ? `WHERE ${conditions.join(" AND ")}`
                : "";


            // ----------------------------------
            // GET TOTAL MATCHING CASES
            // ----------------------------------

            const countResult = await pool.query(
                `
                SELECT COUNT(*) AS total
                FROM cases
                ${whereClause}
                `,
                params
            );

            const totalCases = Number(countResult.rows[0].total);


            // ----------------------------------
            // GET PAGINATED CASE RECORDS
            // ----------------------------------

            const dataParams = [...params];

            dataParams.push(limit);
            const limitIndex = dataParams.length;

            dataParams.push(offset);
            const offsetIndex = dataParams.length;

            const casesResult = await pool.query(
                `
                SELECT
                    id,
                    case_number,
                    complainant_name,
                    respondent_name,
                    dispute_type,
                    status,
                    screening_status,
                    case_stage,
                    created_at,
                    updated_at

                FROM cases

                ${whereClause}

                ORDER BY created_at DESC

                LIMIT $${limitIndex}
                OFFSET $${offsetIndex}
                `,
                dataParams
            );


            // ----------------------------------
            // FORMAT RESPONSE
            // ----------------------------------

            const cases = casesResult.rows.map(item => ({
                id: item.id,
                caseNumber: item.case_number,
                complainantName: item.complainant_name,
                respondentName: item.respondent_name,
                disputeType: item.dispute_type,
                status: item.status,
                screeningStatus: item.screening_status,
                caseStage: item.case_stage,
                createdAt: item.created_at,
                updatedAt: item.updated_at
            }));


            // ----------------------------------
            // SEND RESPONSE
            // ----------------------------------

            return res.status(200).json({

                success: true,

                pagination: {
                    currentPage: page,
                    limit,
                    totalCases,
                    totalPages: Math.ceil(totalCases / limit)
                },

                filters: {
                    search,
                    status,
                    caseStage
                },

                cases

            });

        } catch (error) {

            console.error(
                "Administrator case oversight error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve case records."
            });

        }

    }
);


module.exports = router;
