
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
    // PRELIMINARY JURISDICTION BLOCKER
    // ======================================

    
    function getScreeningBlockReason() {

        const answers = {
            governmentParty: form.elements.governmentParty.value,
            publicOfficial: form.elements.publicOfficial.value,
            penaltyThreshold: form.elements.penaltyThreshold.value,
            privateOffendedParty: form.elements.privateOffendedParty.value,
            realPropertyException: form.elements.realPropertyException.value,
            differentMunicipalitiesException:
                form.elements.differentMunicipalitiesException.value
        };

        const complainantMunicipality =
            form.elements.complainantMunicipality.value.trim().toLowerCase();

        const respondentMunicipality =
            form.elements.respondentMunicipality.value.trim().toLowerCase();

        if (answers.governmentParty === "yes") {
            return {
                field: "governmentParty",
                reason:
                    "One party is identified as the government or one of its subdivisions or instrumentalities. Examples include the PNP, AFP, DepEd, DOH, DSWD, and local government units. Disputes involving the government as a party are excluded under Section 408(a) of RA 7160."
            };
        }

        if (answers.publicOfficial === "yes") {
            return {
                field: "publicOfficial",
                reason:
                    "The dispute is identified as involving a public officer or employee in relation to official functions. This is excluded under Section 408(b) of RA 7160."
            };
        }

        if (answers.penaltyThreshold === "yes") {
            return {
                field: "penaltyThreshold",
                reason:
                    "The stated possible penalty exceeds one year of imprisonment or a fine of ₱5,000. This may fall outside the ordinary jurisdiction of the Barangay Justice System under Section 408(c) of RA 7160."
            };
        }

        if (
            answers.penaltyThreshold === "not_applicable" &&
            answers.privateOffendedParty !== "not_applicable"
        ) {
            return null; // Backend will classify this for staff review.
        }

        if (
            answers.penaltyThreshold !== "not_applicable" &&
            answers.privateOffendedParty === "no"
        ) {
            return {
                field: "privateOffendedParty",
                reason:
                    "Your answer indicates that the alleged offense has no private offended party. This is an exclusion under Section 408(d) of RA 7160."
            };
        }

        if (answers.realPropertyException === "yes") {
            return {
                field: "realPropertyException",
                reason:
                    "The real properties may be located in different cities or municipalities without an agreement to submit the dispute to this Lupon. This may fall outside its territorial jurisdiction under Section 408(e) of RA 7160."
            };
        }

        if (
            answers.differentMunicipalitiesException === "yes" &&
            complainantMunicipality !== respondentMunicipality
        ) {
            return {
                field: "differentMunicipalitiesException",
                reason:
                    "The parties may reside in different cities or municipalities where their barangays are not adjoining, or they do not both agree to submit the dispute to this Lupon. This is covered by Section 408(f) of RA 7160."
            };
        }

        return null;
    }


    // ======================================
    // DISPLAY JURISDICTION WARNING
    // ======================================

    function showJurisdictionWarning(blockReason) {

        messageBox.replaceChildren();
        messageBox.className = "message error";
        messageBox.style.whiteSpace = "normal";

        const warning = document.createElement("div");
        warning.className = "jurisdiction-warning";

        const heading = document.createElement("h3");
        heading.textContent = "Complaint Cannot Proceed";

        const description = document.createElement("p");
        description.textContent = blockReason.reason;

        const legalNotice = document.createElement("p");
        legalNotice.textContent =
            "Based on your answers, this complaint may fall outside the jurisdiction of the Barangay Justice System under Section 408 of the Local Government Code (RA 7160).";

        const instruction = document.createElement("p");
        instruction.textContent =
            "You cannot continue with this online complaint submission. Please review your answers or seek guidance from the appropriate office.";

        const reviewButton = document.createElement("button");
        reviewButton.type = "button";
        reviewButton.className = "button button-secondary";
        reviewButton.textContent = "Review My Answers";

        reviewButton.addEventListener("click", () => {
            const field = document.getElementById(blockReason.field);

            if (field) {
                field.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                field.focus({ preventScroll: true });
            }
        });

        warning.append(
            heading,
            description,
            legalNotice,
            instruction,
            reviewButton
        );

        messageBox.appendChild(warning);

        messageBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
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
        // CHECK PRELIMINARY JURISDICTION
        // ==================================

        const screeningBlock = getScreeningBlockReason();

        if (screeningBlock) {
            showJurisdictionWarning(screeningBlock);
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

            penaltyThreshold: formData.get("penaltyThreshold"),
            privateOffendedParty: formData.get("privateOffendedParty"),

            realPropertyException: formData.get("realPropertyException"),

            differentMunicipalitiesException: formData.get(
                "differentMunicipalitiesException"
            )
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
            "complainantEmail",
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

                if (result.code === "JURISDICTION_EXCLUDED") {

                    showJurisdictionWarning({
                        field: "",
                        reason:
                            result.screeningReasons?.join("\n") ||
                            result.message
                    });

                    return;
                }

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
