
/* ==========================================
   LUPONRESOLVE — PUBLIC CASE TRACKING
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("trackingForm");
    const messageBox = document.getElementById("trackingMessage");
    const resultBox = document.getElementById("trackingResult");
    const trackButton = document.getElementById("trackCaseBtn");

    const caseNumberInput = document.getElementById("caseNumber");
    const trackingCodeInput = document.getElementById("trackingCode");

    const resultCaseNumber = document.getElementById("resultCaseNumber");
    const resultStatus = document.getElementById("resultStatus");
    const resultStage = document.getElementById("resultStage");
    const resultDateSubmitted = document.getElementById("resultDateSubmitted");
    const resultLastUpdated = document.getElementById("resultLastUpdated");
    const resultStatusBadge = document.getElementById("resultStatusBadge");

    if (
        !form ||
        !messageBox ||
        !resultBox ||
        !trackButton
    ) {
        console.error("Tracking page elements could not be found.");
        return;
    }

    // ======================================
    // MESSAGE HELPER
    // ======================================

    function showMessage(message, type = "") {
        messageBox.textContent = message;
        messageBox.className = `tracking-message ${type}`;
    }

    // ======================================
    // DATE FORMATTER
    // ======================================

    function formatDate(dateValue) {

        if (!dateValue) {
            return "Unavailable";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Unavailable";
        }

        return date.toLocaleString();
    }

    // ======================================
    // STATUS BADGE
    // ======================================

    function updateStatusBadge(status) {

        resultStatusBadge.textContent = status;

        const normalizedStatus = status
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        resultStatusBadge.className = "status-badge";

        if (
            normalizedStatus.includes("resolved") ||
            normalizedStatus.includes("closed")
        ) {
            resultStatusBadge.classList.add("status-completed");
        } else if (
            normalizedStatus.includes("awaiting") ||
            normalizedStatus.includes("pending") ||
            normalizedStatus.includes("review")
        ) {
            resultStatusBadge.classList.add("status-pending");
        } else {
            resultStatusBadge.classList.add("status-progress");
        }
    }

    // ======================================
    // CLEAR RESULTS
    // ======================================

    function clearResults() {

        resultBox.classList.add("hidden");

        resultCaseNumber.textContent = "";
        resultStatus.textContent = "";
        resultStage.textContent = "";
        resultDateSubmitted.textContent = "";
        resultLastUpdated.textContent = "";
        resultStatusBadge.textContent = "";
    }

    // ======================================
    // FORM SUBMISSION
    // ======================================

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearResults();
        showMessage("");

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const caseNumber = caseNumberInput.value
            .trim()
            .toUpperCase();

        const trackingCode = trackingCodeInput.value.trim();

        // ==================================
        // LOADING STATE
        // ==================================

        trackButton.disabled = true;
        trackButton.textContent = "Checking Case...";

        try {

            const response = await fetch(`${API.cases}/track`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    caseNumber,
                    trackingCode
                })
            });

            const result = await response.json();

            // ==================================
            // HANDLE INVALID TRACKING DETAILS
            // ==================================

            if (!response.ok || !result.success) {

                throw new Error(
                    result.message ||
                    "Unable to find your case. Please check your tracking details."
                );
            }

            const trackedCase = result.case;

            if (!trackedCase) {
                throw new Error("Tracking information is unavailable.");
            }

            // ==================================
            // DISPLAY CASE INFORMATION
            // ==================================

            const status = trackedCase.status || "Unavailable";

            resultCaseNumber.textContent =
                trackedCase.caseNumber || "Unavailable";

            resultStatus.textContent = status;

            resultStage.textContent =
                trackedCase.caseStage || "Unavailable";

            resultDateSubmitted.textContent =
                formatDate(trackedCase.dateSubmitted);

            resultLastUpdated.textContent =
                formatDate(trackedCase.lastUpdated);

            updateStatusBadge(status);

            resultBox.classList.remove("hidden");

            showMessage(
                "Your case tracking information was retrieved successfully.",
                "success"
            );

            resultBox.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } catch (error) {

            console.error("Case tracking error:", error);

            showMessage(
                error.message ||
                "An error occurred while tracking your case.",
                "error"
            );

        } finally {

            trackButton.disabled = false;
            trackButton.innerHTML =
                'Track My Case <span aria-hidden="true">→</span>';
        }
    });

});
