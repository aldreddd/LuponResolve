
const pool = require("../config/postgres");

const {
    sendHearingNotification
} = require("./emailService");

// ======================================
// HEARING NOTIFICATION SERVICE
// ======================================

async function notifyHearingParties(hearingId, action) {
    try {
        const result = await pool.query(
            `
            SELECT
                h.id AS hearing_id,
                h.hearing_type,
                h.scheduled_at,
                h.venue,
                c.case_number,
                c.complainant_name,
                c.respondent_name,
                c.respondent_email,
                COALESCE(
                    NULLIF(TRIM(c.complainant_email), ''),
                    u.email
                ) AS complainant_email
            FROM hearings h
            INNER JOIN cases c
                ON c.id = h.case_id
            LEFT JOIN users u
                ON u.id = c.resident_id
            WHERE h.id = $1
            `,
            [hearingId]
        );

        if (result.rows.length === 0) {
            console.error(
                "Cannot send hearing notification: hearing not found."
            );
            return;
        }

        const hearing = result.rows[0];

        const recipients = [
            {
                partyType: "complainant",
                name: hearing.complainant_name,
                email: hearing.complainant_email
            },
            {
                partyType: "respondent",
                name: hearing.respondent_name,
                email: hearing.respondent_email
            }
        ];

        // SAFE EMAIL TEST MODE
        const emailTestMode =
            process.env.EMAIL_TEST_MODE === "true";

        const testRecipient =
            process.env.EMAIL_TEST_RECIPIENT;

        for (const recipient of recipients) {

            // Never send real party emails while test mode is enabled.
            if (emailTestMode && !testRecipient) {
                console.error(
                    "Email test mode is enabled, but EMAIL_TEST_RECIPIENT is missing."
                );
                continue;
            }

            const destinationEmail = emailTestMode
                ? testRecipient
                : recipient.email;

            if (!destinationEmail) {
                console.warn(
                    `No email address for ${recipient.partyType} of hearing ${hearingId}.`
                );
                continue;
            }

            const notificationResult = await pool.query(
                `
                INSERT INTO hearing_notifications (
                    hearing_id,
                    party_type,
                    recipient_email,
                    notification_type,
                    delivery_status
                )
                VALUES ($1, $2, $3, $4, 'Pending')
                RETURNING id
                `,
                [
                    hearingId,
                    recipient.partyType,
                    destinationEmail,
                    action
                ]
            );

            const notificationId =
                notificationResult.rows[0].id;

            try {
                const emailResult = await sendHearingNotification({
                    to: destinationEmail,
                    recipientName: recipient.name,
                    caseNumber: hearing.case_number,
                    hearingType: hearing.hearing_type,
                    scheduledAt: hearing.scheduled_at,
                    venue: hearing.venue,
                    action
                });

                await pool.query(
                    `
                    UPDATE hearing_notifications
                    SET
                        delivery_status = 'Sent',
                        provider_message_id = $1,
                        sent_at = NOW()
                    WHERE id = $2
                    `,
                    [
                        emailResult.emailId,
                        notificationId
                    ]
                );

                console.log(
                    `Hearing notification sent to ${recipient.partyType}.`
                );

            } catch (emailError) {
                await pool.query(
                    `
                    UPDATE hearing_notifications
                    SET
                        delivery_status = 'Failed',
                        error_message = $1
                    WHERE id = $2
                    `,
                    [
                        emailError.message,
                        notificationId
                    ]
                );

                console.error(
                    `Failed to notify ${recipient.partyType}:`,
                    emailError.message
                );
            }
        }

    } catch (error) {
        console.error(
            "Hearing notification process failed:",
            error.message
        );
    }
}

module.exports = {
    notifyHearingParties
};
