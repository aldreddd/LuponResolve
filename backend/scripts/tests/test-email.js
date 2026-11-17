
require("dotenv").config();

const {
    createHearingEmail,
    formatHearingDate
} = require("../../services/emailService");

const testHearing = {
    recipientName: "Test Resident",
    caseNumber: "LR-00005",
    hearingType: "Mediation",
    scheduledAt: "2026-11-27T02:30:00.000Z",
    venue: "Barangay Hall - Conference Room"
};

console.log("\n===== SCHEDULED EMAIL =====");

const scheduled = createHearingEmail({
    ...testHearing,
    action: "scheduled"
});

console.log("Subject:", scheduled.subject);
console.log("HTML generated:", scheduled.html.length > 0);

console.log("\n===== RESCHEDULED EMAIL =====");

const rescheduled = createHearingEmail({
    ...testHearing,
    action: "rescheduled"
});

console.log("Subject:", rescheduled.subject);
console.log("HTML generated:", rescheduled.html.length > 0);

console.log("\n===== CANCELLED EMAIL =====");

const cancelled = createHearingEmail({
    ...testHearing,
    action: "cancelled"
});

console.log("Subject:", cancelled.subject);
console.log("HTML generated:", cancelled.html.length > 0);

console.log("\n===== DATE FORMATTING =====");

console.log(
    "Philippine date:",
    formatHearingDate(testHearing.scheduledAt)
);

console.log("\nEmail template tests completed.");

