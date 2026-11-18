
/* ==========================================
   LUPONRESOLVE — GUEST COMPLAINT FORM
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("guestComplaintForm");
    const messageBox = document.getElementById("formMessage");
    const submitButton = document.getElementById("submitComplaintBtn");

    if (!form || !messageBox || !submitButton) {
        console.error("Guest complaint form elements could not be found.");
        return;
    }

    // ======================================
    // MESSAGE HELPERS
    // ======================================

    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = `message ${type}`;
        messageBox.style.whiteSpace = "pre-line";
    }

    function clearMessage() {
        messageBox.textContent = "";
        messageBox.className = "";
        messageBox.style.whiteSpace = "";
    }

    // ======================================
    // SUCCESS CARD
    // ======================================

    function showSuccessCard(caseNumber, trackingCode, screeningStatus) {

        messageBox.replaceChildren();
        messageBox.className = "message success";
        messageBox.style.whiteSpace = "normal";

        const card = document.createElement("div");
        card.className = "success-card";

        const header = document.createElement("div");
        header.className = "success-card-header";

        const icon = document.createElement("div");
        icon.className = "success-icon";
        icon.textContent = "✓";

        const headingContainer = document.createElement("div");

        const heading = document.createElement("h2");
        heading.textContent = "Complaint Submitted Successfully!";

        const description = document.createElement("p");
        description.textContent =
            "Your complaint has been received by LuponResolve.";

        headingContainer.append(heading, description);
        header.append(icon, headingContainer);

        const body = document.createElement("div");
        body.className = "success-card-body";

        function createDetail(label, value, extraClass = "") {
            const container = document.createElement("div");
            container.className = `tracking-detail ${extraClass}`.trim();

            const labelElement = document.createElement("span");
            labelElement.textContent = label;

            const valueElement = document.createElement("strong");
            valueElement.textContent = value;

            container.append(labelElement, valueElement);

            return container;
        }

        body.append(
            createDetail("CASE NUMBER", caseNumber),
            createDetail("TRACKING CODE", trackingCode, "tracking-code-detail")
        );

        const privacyNotice = document.createElement("div");
        privacyNotice.className = "privacy-notice";

        const privacyHeading = document.createElement("strong");
        privacyHeading.textContent =
            "Important — Keep Your Tracking Details Safe";

        const privacyText = document.createElement("p");
        privacyText.textContent =
            "Save both your case number and tracking code. " +
            "You will need them to track your complaint later. " +
            "Your tracking code is private. Do not share it with others.";

        privacyNotice.append(privacyHeading, privacyText);

        const screening = document.createElement("div");
        screening.className = "screening-result";

        const screeningLabel = document.createElement("span");
        screeningLabel.textContent = "PRELIMINARY SCREENING RESULT";

        const screeningValue = document.createElement("strong");
        screeningValue.textContent = screeningStatus;

        screening.append(screeningLabel, screeningValue);

        body.append(privacyNotice, screening);
        card.append(header, body);

        messageBox.appendChild(card);

        messageBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    // ======================================
    // FORM SUBMISSION
    // ======================================

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearMessage();

        if (submitButton.disabled) {
            return;
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // ==================================
        // COLLECT FORM VALUES
        // ==================================

        const formData = new FormData(form);

        const payload = {

            complainantName:
                formData.get("complainantName")?.trim(),

            complainantContact:
                formData.get("complainantContact")?.trim(),

            respondentName:
                formData.get("respondentName")?.trim(),

            respondentAddress:
                formData.get("respondentAddress")?.trim(),

            respondentEmail:
                formData.get("respondentEmail")?.trim(),

            disputeType:
                formData.get("disputeType"),

            incidentDetails:
                formData.get("incidentDetails")?.trim(),

            screeningAnswers: {

                complainantMunicipality:
                    formData.get("complainantMunicipality"),

                complainantBarangay:
                    formData.get("complainantBarangay"),

                respondentMunicipality:
                    formData.get("respondentMunicipality"),

                respondentBarangay:
                    formData.get("respondentBarangay"),

                governmentParty:
                    formData.get("governmentParty"),

                publicOfficial:
                    formData.get("publicOfficial"),

                criminalOffense:
                    formData.get("criminalOffense"),

                penaltyThreshold:
                    formData.get("penaltyThreshold"),

                privateOffendedParty:
                    formData.get("privateOffendedParty"),

                realPropertyDispute:
                    formData.get("realPropertyDispute"),

                propertyDifferentCities:
                    formData.get("propertyDifferentCities"),

                propertyPartiesAgree:
                    formData.get("propertyPartiesAgree"),

                barangaysAdjoining:
                    formData.get("barangaysAdjoining"),

                partiesAgree:
                    formData.get("partiesAgree"),

                otherException:
                    formData.get("otherException")
            },

            companyWebsite:
                formData.get("companyWebsite") || ""
        };

        // ==================================
        // LOADING STATE
        // ==================================

        const originalButtonText = submitButton.textContent;

        submitButton.disabled = true;
        submitButton.textContent = "Submitting complaint...";

        // ==================================
        // SEND TO BACKEND
        // ==================================

        try {

            const response = await fetch(`${API.cases}/guest`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)
            });

            const result = await response.json();

            // ==================================
            // HANDLE ERRORS
            // ==================================

            if (!response.ok) {

                const errorMessage =
                    result.message ||
                    result.error ||
                    "Your complaint could not be submitted. Please review your information and try again.";

                showMessage(errorMessage, "error");

                return;
            }

            // ==================================
            // SUCCESS
            // ==================================

            const caseNumber =
                result.caseNumber || "Unavailable";

            const trackingCode =
                result.trackingCode || "Unavailable";

            const screeningStatus =
                result.screeningStatus ||
                "Requires Barangay Staff Review";

            form.reset();

            showSuccessCard(
                caseNumber,
                trackingCode,
                screeningStatus
            );

        } catch (error) {

            console.error("Guest complaint submission error:", error);

            showMessage(
                "Unable to connect to the LuponResolve server. Please check your internet connection and try again.",
                "error"
            );

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });

});
