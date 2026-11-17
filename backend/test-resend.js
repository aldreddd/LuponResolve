
require("dotenv").config();

const { sendEmail } = require("./services/emailService");

async function testResend() {
    try {
        console.log("\n===== RESEND API TEST =====");

        const result = await sendEmail({
            to: ["delivered@resend.dev"],
            subject: "LuponResolve - Resend Integration Test",
            html: `
                <h2>LuponResolve</h2>
                <p>This is a test of the Resend email integration.</p>
                <p>No resident notification was triggered.</p>
            `
        });

        console.log("Resend API test successful.");
        console.log("Provider message ID:", result.emailId);

    } catch (error) {
        console.error("Resend API test failed:", error.message);

    } finally {
        process.exit();
    }
}

testResend();
