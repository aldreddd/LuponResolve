
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

module.exports = {
    sendEmail,
    sendHearingNotification,
    createHearingEmail,
    formatHearingDate
};
