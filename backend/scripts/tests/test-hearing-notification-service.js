
require("dotenv").config();

const pool = require("../../config/postgres");

const {
    notifyHearingParties
} = require("../../services/hearingNotificationService");

async function testNotificationService() {
    try {
        console.log("\n===== NOTIFICATION SERVICE TEST =====");

        if (process.env.EMAIL_TEST_MODE !== "true") {
            throw new Error(
                "Email test mode is not enabled. Test aborted."
            );
        }

        const hearingId = 1;
        const action = "cancelled";

        console.log("Hearing ID:", hearingId);
        console.log("Action:", action);
        console.log("Email test mode:", process.env.EMAIL_TEST_MODE);

        await notifyHearingParties(hearingId, action);

        console.log("\nNotification service execution completed.");

    } catch (error) {
        console.error("\nTest failed:", error.message);

    } finally {
        await pool.end();
    }
}

testNotificationService();

