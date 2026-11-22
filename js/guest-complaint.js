
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
    // EVIDENCE FILE SELECTION
    // ======================================

    const evidenceFilesInput = document.getElementById("evidenceFiles");
    const evidenceFileList = document.getElementById("evidenceFileList");

    const MAX_EVIDENCE_FILES = 5;
    const MAX_EVIDENCE_FILE_SIZE = 5 * 1024 * 1024;

    const ALLOWED_EVIDENCE_TYPES = [
        "image/jpeg",
        "image/png",
        "application/pdf"
    ];

    if (evidenceFilesInput) {
        evidenceFilesInput.addEventListener("change", () => {
            const files = Array.from(evidenceFilesInput.files);

            evidenceFileList.innerHTML = "";

            if (files.length > MAX_EVIDENCE_FILES) {
                showMessage(
                    "You can upload a maximum of 5 evidence files.",
                    "error"
                );

                evidenceFilesInput.value = "";
                return;
            }

            for (const file of files) {
                if (!ALLOWED_EVIDENCE_TYPES.includes(file.type)) {
                    showMessage(
                        `${file.name} is not an allowed file type.`,
                        "error"
                    );

                    evidenceFilesInput.value = "";
                    evidenceFileList.innerHTML = "";
                    return;
                }

                if (file.size > MAX_EVIDENCE_FILE_SIZE) {
                    showMessage(
                        `${file.name} exceeds the 5 MB file size limit.`,
                        "error"
                    );

                    evidenceFilesInput.value = "";
                    evidenceFileList.innerHTML = "";
                    return;
                }
            }

            if (files.length === 0) {
                return;
            }

            clearMessage();

            files.forEach((file) => {
                const item = document.createElement("div");
                item.className = "evidence-file-item";

                const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

                item.textContent = `${file.name} (${sizeMB} MB)`;

                evidenceFileList.appendChild(item);
            });
        });
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

        const screeningAnswers = {
            complainantMunicipality: formData.get("complainantMunicipality"),
            complainantBarangay: formData.get("complainantBarangay"),

            respondentMunicipality: formData.get("respondentMunicipality"),
            respondentBarangay: formData.get("respondentBarangay"),

            governmentParty: formData.get("governmentParty"),
            publicOfficial: formData.get("publicOfficial"),
            criminalOffense: formData.get("criminalOffense"),
            penaltyThreshold: formData.get("penaltyThreshold"),
            privateOffendedParty: formData.get("privateOffendedParty"),

            realPropertyDispute: formData.get("realPropertyDispute"),
            propertyDifferentCities: formData.get("propertyDifferentCities"),
            propertyPartiesAgree: formData.get("propertyPartiesAgree"),

            barangaysAdjoining: formData.get("barangaysAdjoining"),
            partiesAgree: formData.get("partiesAgree"),
            otherException: formData.get("otherException")
        };

        // Convert screening answers into JSON text.
        formData.set(
            "screeningAnswers",
            JSON.stringify(screeningAnswers)
        );

        // Trim text fields.
        [
            "complainantName",
            "complainantContact",
            "respondentName",
            "respondentAddress",
            "respondentEmail",
            "disputeType",
            "incidentDetails"
        ].forEach((field) => {
            const value = formData.get(field);

            if (typeof value === "string") {
                formData.set(field, value.trim());
            }
        });

        // Ensure the honeypot field is included.
        formData.set(
            "companyWebsite",
            formData.get("companyWebsite") || ""
        );

        // Remove empty file entries and append selected evidence.
        formData.delete("evidence");

        const selectedEvidenceFiles = evidenceFilesInput
            ? Array.from(evidenceFilesInput.files)
            : [];

        selectedEvidenceFiles.forEach((file) => {
            formData.append("evidence", file);
        });


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
                body: formData
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
