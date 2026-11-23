
const { sendGmailMessage } = require("./gmailService");

// ======================================
// EMAIL SENDING FUNCTION
// ======================================

async function sendEmail({ to, subject, html }) {
    try {
        const result = await sendGmailMessage({
            to,
            subject,
            html
        });

        console.log("Email sent through Gmail:", result.emailId);

        return {
            success: true,
            emailId: result.emailId
        };

    } catch (error) {
        console.error("Email sending failed:", error.message);
        throw error;
    }
}

// ======================================
// DATE FORMATTER
// ======================================

function formatHearingDate(date) {
    return new Intl.DateTimeFormat("en-PH", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Asia/Manila"
    }).format(new Date(date));
}

// ======================================
// HEARING EMAIL TEMPLATE
// ======================================

function createHearingEmail({
    recipientName,
    caseNumber,
    hearingType,
    scheduledAt,
    venue,
    action
}) {
    const messages = {
        scheduled: {
            subject: "LuponResolve - Hearing Scheduled",
            heading: "Hearing Scheduled",
            description: "A hearing has been scheduled for your barangay dispute case."
        },
        rescheduled: {
            subject: "LuponResolve - Hearing Rescheduled",
            heading: "Hearing Rescheduled",
            description: "Your previously scheduled hearing has been rescheduled."
        },
        cancelled: {
            subject: "LuponResolve - Hearing Cancelled",
            heading: "Hearing Cancelled",
            description: "Your previously scheduled hearing has been cancelled."
        }
    };

    const message = messages[action];

    if (!message) {
        throw new Error("Invalid hearing email action.");
    }

    const safeName = escapeHtml(recipientName || "Resident");
    const safeCaseNumber = escapeHtml(caseNumber || "N/A");
    const safeHearingType = escapeHtml(hearingType || "Hearing");
    const safeVenue = escapeHtml(venue || "To be announced");

    const formattedDate = action === "cancelled"
        ? ""
        : escapeHtml(formatHearingDate(scheduledAt));

    return {
        subject: message.subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #333;">
                <h2 style="color: #234b72;">LuponResolve</h2>

                <h3>${message.heading}</h3>

                <p>Hello ${safeName},</p>

                <p>${message.description}</p>

                <hr>

                <p><strong>Case Number:</strong> ${safeCaseNumber}</p>
                <p><strong>Hearing Type:</strong> ${safeHearingType}</p>

                ${formattedDate ? `<p><strong>Date and Time:</strong> ${formattedDate}</p>` : ""}

                ${action !== "cancelled" ? `<p><strong>Venue:</strong> ${safeVenue}</p>` : ""}

                <hr>

                <p>Please contact your barangay office if you have questions regarding this notice.</p>

                <p>Regards,<br><strong>LuponResolve</strong></p>
            </div>
        `
    };
}

// ======================================
// HTML ESCAPING
// ======================================

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// ======================================
// HEARING NOTIFICATION
// ======================================

async function sendHearingNotification({
    to,
    recipientName,
    caseNumber,
    hearingType,
    scheduledAt,
    venue,
    action
}) {
    if (!to) {
        return {
            success: false,
            skipped: true,
            reason: "Recipient email is missing."
        };
    }

    const email = createHearingEmail({
        recipientName,
        caseNumber,
        hearingType,
        scheduledAt,
        venue,
        action
    });

    return sendEmail({
        to: [to],
        subject: email.subject,
        html: email.html
    });
}


// ======================================
// RESPONDENT COMPLAINT NOTIFICATION
// ======================================

function createRespondentComplaintEmail({
    respondentName,
    caseNumber
}) {
    const safeName = escapeHtml(respondentName || "Respondent");
    const safeCaseNumber = escapeHtml(caseNumber);

    return {
        subject: `Barangay Complaint Notice - ${safeCaseNumber}`,

        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #263449; line-height: 1.6;">

                <h2 style="color: #173b70;">
                    Barangay Complaint Notice
                </h2>

                <p>Dear ${safeName},</p>

                <p>
                    This is to inform you that a complaint involving you
                    has been submitted to the Barangay for initial review.
                </p>

                <div style="background: #f1f5fb; padding: 18px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 8px;">
                        <strong>Case Reference Number:</strong>
                    </p>

                    <h2 style="margin: 0; color: #173b70;">
                        ${safeCaseNumber}
                    </h2>
                </div>

                <p>
                    Please await further official communication from
                    the Barangay regarding any necessary clarification
                    or proceedings.
                </p>

                <p>
                    This notice is for informational purposes only.
                    It does not constitute a finding of liability or
                    establish that the allegations are true.
                </p>

                <p>
                    If you believe this notice was sent to you in error,
                    please contact the Barangay office.
                </p>

                <p>
                    Respectfully,<br>
                    <strong>Barangay Office</strong>
                </p>

            </div>
        `
    };
}

async function sendRespondentComplaintNotification({
    to,
    respondentName,
    caseNumber
}) {
    if (!to) {
        return {
            success: false,
            skipped: true,
            reason: "Respondent email is missing."
        };
    }

    // Keep test emails from reaching actual respondents.
    const testMode = process.env.EMAIL_TEST_MODE === "true";
    const testRecipient = process.env.EMAIL_TEST_RECIPIENT;

    if (testMode && !testRecipient) {
        return {
            success: false,
            skipped: true,
            reason: "Test mode is enabled but no test recipient is configured."
        };
    }

    const email = createRespondentComplaintEmail({
        respondentName,
        caseNumber
    });

    return sendEmail({
        to: [testMode ? testRecipient : to],
        subject: email.subject,
        html: email.html
    });
}


// ======================================
// COMPLAINANT COMPLAINT CONFIRMATION
// ======================================

function createComplainantComplaintEmail({
    complainantName,
    caseNumber,
    trackingCode
}) {
    const safeName = escapeHtml(complainantName || "Complainant");
    const safeCaseNumber = escapeHtml(caseNumber);
    const safeTrackingCode = escapeHtml(trackingCode);

    return {
        subject: `LuponResolve - Complaint Submission Confirmation (${safeCaseNumber})`,

        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #263449; line-height: 1.6;">

                <h2 style="color: #173b70;">LuponResolve</h2>

                <h3>Complaint Submitted Successfully</h3>

                <p>Dear ${safeName},</p>

                <p>
                    Your complaint has been successfully received by
                    LuponResolve and submitted to the Barangay for initial review.
                </p>

                <div style="background: #f1f5fb; padding: 18px; border-radius: 8px; margin: 20px 0;">

                    <p><strong>Case Number:</strong></p>
                    <h2 style="color: #173b70; margin-top: 0;">
                        ${safeCaseNumber}
                    </h2>

                    <p><strong>Your Private Tracking Code:</strong></p>
                    <div style="background: #ffffff; padding: 12px; border: 1px solid #d5dfed; border-radius: 6px; word-break: break-all;">
                        <strong>${safeTrackingCode}</strong>
                    </div>

                </div>

                <p>
                    Keep your case number and private tracking code safe.
                    You will need both details to access your complaint's
                    tracking information.
                </p>

                <p>
                    <strong>Important:</strong> Do not share your private
                    tracking code with other people. The Barangay will
                    review your complaint and provide further communication
                    when necessary.
                </p>

                <p>
                    This confirmation does not mean that your complaint
                    has already been accepted for Barangay Justice System
                    proceedings.
                </p>

                <p>
                    Respectfully,<br>
                    <strong>LuponResolve</strong>
                </p>

            </div>
        `
    };
}

async function sendComplainantComplaintNotification({
    to,
    complainantName,
    caseNumber,
    trackingCode
}) {
    if (!to) {
        return {
            success: false,
            skipped: true,
            reason: "Complainant email is missing."
        };
    }

    if (!trackingCode) {
        throw new Error("Complainant tracking code is required.");
    }

    // Redirect test emails to the configured test recipient.
    const testMode = process.env.EMAIL_TEST_MODE === "true";
    const testRecipient = process.env.EMAIL_TEST_RECIPIENT;

    if (testMode && !testRecipient) {
        return {
            success: false,
            skipped: true,
            reason: "Test mode is enabled but no test recipient is configured."
        };
    }

    const email = createComplainantComplaintEmail({
        complainantName,
        caseNumber,
        trackingCode
    });

    return sendEmail({
        to: [testMode ? testRecipient : to],
        subject: email.subject,
        html: email.html
    });
}


module.exports = {
    sendEmail,
    sendHearingNotification,
    createHearingEmail,
    formatHearingDate,

    // Respondent complaint notification
    createRespondentComplaintEmail,
    sendRespondentComplaintNotification,

    // Complainant complaint confirmation
    createComplainantComplaintEmail,
    sendComplainantComplaintNotification
};
