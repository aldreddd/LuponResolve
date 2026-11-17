
require("dotenv").config();

const pool = require("./config/postgres");

const {
    sendHearingNotification
} = require("./services/emailService");

const TEST_RECIPIENT = "delivered@resend.dev";
const HEARING_ID = 1;
const ACTION = "cancelled";

async function testHearingNotifications() {
    try {
        // Safety check: never run this test without test mode.
        if (process.env.EMAIL_TEST_MODE !== "true") {
            throw new Error(
                "Email test mode is not enabled. Test aborted."
            );
        }

        console.log("\n===== HEARING NOTIFICATION TEST =====");

        // Retrieve the existing test hearing.
        const result = await pool.query(
            `
            SELECT
                h.id AS hearing_id,
                h.hearing_type,
                h.scheduled_at,
                h.venue,
                c.case_number,
                c.complainant_name,
                c.respondent_name
            FROM hearings h
            INNER JOIN cases c
                ON c.id = h.case_id
            WHERE h.id = $1
            `,
            [HEARING_ID]
        );

        if (result.rows.length === 0) {
            throw new Error("Test hearing not found.");
        }

        const hearing = result.rows[0];

        console.log("Hearing:", hearing.hearing_id);
        console.log("Case:", hearing.case_number);
        console.log("Status: Test only - no status changes");

        // Test both party notification paths.
        const recipients = [
            {
                partyType: "complainant",
                name: hearing.complainant_name
            },
            {
                partyType: "respondent",
                name: hearing.respondent_name
            }
        ];

        for (const recipient of recipients) {
            console.log(`\nTesting ${recipient.partyType} notification...`);

            // Create a Pending notification record.
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
                    HEARING_ID,
                    recipient.partyType,
                    TEST_RECIPIENT,
                    ACTION
                ]
            );

            const notificationId = notificationResult.rows[0].id;

            try {
                // Always send to Resend's test recipient.
                const emailResult = await sendHearingNotification({
                    to: TEST_RECIPIENT,
                    recipientName: recipient.name,
                    caseNumber: hearing.case_number,
                    hearingType: hearing.hearing_type,
                    scheduledAt: hearing.scheduled_at,
                    venue: hearing.venue,
                    action: ACTION
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
                    [emailResult.emailId, notificationId]
                );

                console.log("Result: Sent");
                console.log("Notification ID:", notificationId);
                console.log("Provider ID:", emailResult.emailId);

            } catch (emailError) {
                await pool.query(
                    `
                    UPDATE hearing_notifications
                    SET
                        delivery_status = 'Failed',
                        error_message = $1
                    WHERE id = $2
                    `,
                    [emailError.message, notificationId]
                );

                console.error("Result: Failed");
                console.error(emailError.message);
            }
        }

        console.log("\n===== TEST COMPLETED =====");
        console.log("No real resident email addresses were used.");
        console.log("No hearing or case statuses were changed.");

    } catch (error) {
        console.error("\nNotification test error:", error.message);

    } finally {
        await pool.end();
    }
}

testHearingNotifications();
