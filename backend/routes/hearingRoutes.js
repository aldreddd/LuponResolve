
const express = require("express");
const pool = require("../config/postgres");
const {
    notifyHearingParties
} = require("../services/hearingNotificationService");

const {
    requireAuth,
    requireRole
} = require("../middleware/authMiddleware");

const router = express.Router();


// ======================================
// HELPER FUNCTIONS
// ======================================

// Require an ISO date with an explicit timezone.
// Example: 2026-11-18T09:00:00+08:00
function isValidFutureDate(value) {
    if (typeof value !== "string") {
        return false;
    }

    const hasTimezone =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(value);

    if (!hasTimezone) {
        return false;
    }

    const date = new Date(value);

    return (
        !Number.isNaN(date.getTime()) &&
        date.getTime() > Date.now()
    );
}


// Check whether the logged-in user can access a case's hearing.
async function findAccessibleHearing(hearingId, user) {
    const result = await pool.query(
        `
        SELECT
            h.*,
            c.case_number,
            c.complainant_name,
            c.respondent_name,
            c.resident_id
        FROM hearings h
        INNER JOIN cases c ON c.id = h.case_id
        WHERE h.id = $1
          AND (
              $2 = 'secretary'
              OR $2 = 'admin'
              OR ($2 = 'resident' AND c.resident_id = $3)
              OR (
                  $2 = 'lupon'
                  AND EXISTS (
                      SELECT 1
                      FROM case_assignments ca
                      WHERE ca.case_id = c.id
                        AND ca.lupon_user_id = $3
                  )
              )
          )
        `,
        [hearingId, user.role, user.id]
    );

    return result.rows[0] || null;
}

// ======================================
// GET ALL ACCESSIBLE HEARINGS
// ======================================

router.get("/", requireAuth, async (req, res) => {
    try {
        const user = req.session.user;

        const result = await pool.query(
            `
            SELECT
                h.*,
                c.case_number,
                c.complainant_name,
                c.respondent_name
            FROM hearings h
            INNER JOIN cases c ON c.id = h.case_id
            WHERE
                $1 = 'secretary'
                OR $1 = 'admin'
                OR ($1 = 'resident' AND c.resident_id = $2)
                OR (
                    $1 = 'lupon'
                    AND EXISTS (
                        SELECT 1
                        FROM case_assignments ca
                        WHERE ca.case_id = c.id
                          AND ca.lupon_user_id = $2
                    )
                )
            ORDER BY h.scheduled_at ASC
            `,
            [user.role, user.id]
        );

        return res.json({
            success: true,
            hearings: result.rows
        });

    } catch (error) {
        console.error("Fetch hearings error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve hearings."
        });
    }
});


// ======================================
// GET ONE ACCESSIBLE HEARING
// ======================================

router.get("/:id", requireAuth, async (req, res) => {
    try {
        const hearingId = Number(req.params.id);

        if (!Number.isInteger(hearingId) || hearingId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid hearing ID."
            });
        }

        const hearing = await findAccessibleHearing(
            hearingId,
            req.session.user
        );

        if (!hearing) {
            return res.status(404).json({
                success: false,
                message: "Hearing not found."
            });
        }

        const history = await pool.query(
            `
            SELECT *
            FROM hearing_history
            WHERE hearing_id = $1
            ORDER BY created_at ASC
            `,
            [hearingId]
        );

        return res.json({
            success: true,
            hearing,
            history: history.rows
        });

    } catch (error) {
        console.error("Fetch hearing error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve hearing."
        });
    }
});


// ======================================
// CREATE HEARING
// Secretary/Admin only
// ======================================

router.post(
    "/",
    requireAuth,
    requireRole("secretary"),
    async (req, res) => {
        const {
            caseId,
            hearingType,
            scheduledAt,
            venue,
            notes
        } = req.body;

        const caseNumber = Number(caseId);

        if (
            !Number.isInteger(caseNumber) ||
            caseNumber <= 0 ||
            typeof hearingType !== "string" ||
            !hearingType.trim() ||
            typeof venue !== "string" ||
            !venue.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Case, hearing type, and venue are required."
            });
        }

        if (!isValidFutureDate(scheduledAt)) {
            return res.status(400).json({
                success: false,
                message: "Provide a valid future date and time with a timezone."
            });
        }

        if (
            notes !== undefined &&
            typeof notes !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Notes must be text."
            });
        }

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const caseResult = await client.query(
                `
                SELECT id, status, case_stage
                FROM cases
                WHERE id = $1
                FOR UPDATE
                `,
                [caseNumber]
            );

            if (caseResult.rows.length === 0) {
                await client.query("ROLLBACK");

                return res.status(404).json({
                    success: false,
                    message: "Case not found."
                });
            }

            const caseRecord = caseResult.rows[0];

            if (
                caseRecord.status === "Closed" ||
                caseRecord.case_stage === "Closed"
            ) {
                await client.query("ROLLBACK");

                return res.status(409).json({
                    success: false,
                    message: "A hearing cannot be scheduled for a closed case."
                });
            }

            const hearingResult = await client.query(
                `
                INSERT INTO hearings (
                    case_id,
                    hearing_type,
                    scheduled_at,
                    venue,
                    notes,
                    created_by
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
                `,
                [
                    caseNumber,
                    hearingType.trim(),
                    scheduledAt,
                    venue.trim(),
                    notes ? notes.trim() : "",
                    req.session.user.id
                ]
            );

            const hearing = hearingResult.rows[0];

            await client.query(
                `
                INSERT INTO hearing_history (
                    hearing_id,
                    action,
                    details,
                    performed_by
                )
                VALUES ($1, $2, $3::jsonb, $4)
                `,
                [
                    hearing.id,
                    "Scheduled",
                    JSON.stringify({
                        scheduledAt: hearing.scheduled_at,
                        venue: hearing.venue,
                        hearingType: hearing.hearing_type
                    }),
                    req.session.user.id
                ]
            );

            await client.query("COMMIT");

                // Send email notifications after the transaction succeeds.
                await notifyHearingParties(hearing.id, "scheduled");

                return res.status(201).json({
                    success: true,
                    message: "Hearing scheduled successfully.",
                    hearing
                });

        } catch (error) {
            await client.query("ROLLBACK");

            console.error("Create hearing error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to schedule hearing."
            });

        } finally {
            client.release();
        }
    }
);


// ======================================
// RESCHEDULE HEARING
// Secretary/Admin only
// ======================================

router.patch(
    "/:id/reschedule",
    requireAuth,
    requireRole("secretary"),
    async (req, res) => {
        const hearingId = Number(req.params.id);
        const { scheduledAt, venue } = req.body;

        if (!Number.isInteger(hearingId) || hearingId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid hearing ID."
            });
        }

        if (!isValidFutureDate(scheduledAt)) {
            return res.status(400).json({
                success: false,
                message: "Provide a valid future date and time with a timezone."
            });
        }

        if (
            venue !== undefined &&
            (typeof venue !== "string" || !venue.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Venue must be valid text."
            });
        }

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const currentResult = await client.query(
                `
                SELECT *
                FROM hearings
                WHERE id = $1
                FOR UPDATE
                `,
                [hearingId]
            );

            if (currentResult.rows.length === 0) {
                await client.query("ROLLBACK");

                return res.status(404).json({
                    success: false,
                    message: "Hearing not found."
                });
            }

            const current = currentResult.rows[0];

            if (
                current.status === "Cancelled" ||
                current.status === "Completed"
            ) {
                await client.query("ROLLBACK");

                return res.status(409).json({
                    success: false,
                    message: "This hearing cannot be rescheduled."
                });
            }

            const newVenue = venue !== undefined
                ? venue.trim()
                : current.venue;

            const updatedResult = await client.query(
                `
                UPDATE hearings
                SET
                    scheduled_at = $1,
                    venue = $2,
                    status = 'Rescheduled',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $3
                RETURNING *
                `,
                [scheduledAt, newVenue, hearingId]
            );

            const updated = updatedResult.rows[0];

            await client.query(
                `
                INSERT INTO hearing_history (
                    hearing_id,
                    action,
                    details,
                    performed_by
                )
                VALUES ($1, $2, $3::jsonb, $4)
                `,
                [
                    hearingId,
                    "Rescheduled",
                    JSON.stringify({
                        previousScheduledAt: current.scheduled_at,
                        newScheduledAt: updated.scheduled_at,
                        previousVenue: current.venue,
                        newVenue: updated.venue
                    }),
                    req.session.user.id
                ]
            );

            await client.query("COMMIT");

            // Notify both parties using the updated hearing details.
            await notifyHearingParties(hearingId, "rescheduled");

            return res.json({
                success: true,
                message: "Hearing rescheduled successfully.",
                hearing: updated
            });

        } catch (error) {
            await client.query("ROLLBACK");

            console.error("Reschedule hearing error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to reschedule hearing."
            });

        } finally {
            client.release();
        }
    }
);


// ======================================
// CANCEL HEARING
// Secretary/Admin only
// ======================================

router.patch(
    "/:id/cancel",
    requireAuth,
    requireRole("secretary"),
    async (req, res) => {
        const hearingId = Number(req.params.id);
        const { reason } = req.body;

        if (!Number.isInteger(hearingId) || hearingId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid hearing ID."
            });
        }

        if (
            reason !== undefined &&
            typeof reason !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Cancellation reason must be text."
            });
        }

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const currentResult = await client.query(
                `
                SELECT *
                FROM hearings
                WHERE id = $1
                FOR UPDATE
                `,
                [hearingId]
            );

            if (currentResult.rows.length === 0) {
                await client.query("ROLLBACK");

                return res.status(404).json({
                    success: false,
                    message: "Hearing not found."
                });
            }

            const current = currentResult.rows[0];

            if (
                current.status === "Cancelled" ||
                current.status === "Completed"
            ) {
                await client.query("ROLLBACK");

                return res.status(409).json({
                    success: false,
                    message: "This hearing cannot be cancelled."
                });
            }

            const updatedResult = await client.query(
                `
                UPDATE hearings
                SET
                    status = 'Cancelled',
                    notes = CASE
                        WHEN $1 = '' THEN notes
                        WHEN notes = '' THEN $1
                        ELSE notes || E'\\n' || $1
                    END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
                `,
                [
                    reason ? `Cancellation reason: ${reason.trim()}` : "",
                    hearingId
                ]
            );

            const updated = updatedResult.rows[0];

            await client.query(
                `
                INSERT INTO hearing_history (
                    hearing_id,
                    action,
                    details,
                    performed_by
                )
                VALUES ($1, $2, $3::jsonb, $4)
                `,
                [
                    hearingId,
                    "Cancelled",
                    JSON.stringify({
                        previousScheduledAt: current.scheduled_at,
                        reason: reason ? reason.trim() : ""
                    }),
                    req.session.user.id
                ]
            );

            await client.query("COMMIT");

            // Notify both parties that the hearing was cancelled.
            await notifyHearingParties(hearingId, "cancelled");

            return res.json({
                success: true,
                message: "Hearing cancelled successfully.",
                hearing: updated
            });

        } catch (error) {
            await client.query("ROLLBACK");

            console.error("Cancel hearing error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to cancel hearing."
            });

        } finally {
            client.release();
        }
    }
);


module.exports = router;
