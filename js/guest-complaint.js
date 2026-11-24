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
    // ENGLISH / CEBUANO LANGUAGE TOGGLE
    // ======================================

    const languageToggleButton = document.getElementById("languageToggleBtn");

    const cebuanTranslations = {
        "Back to Home": "Balik sa Panid sa Puy-anan",
        "← Back to Home": "← Balik sa Panid sa Puy-anan",
        "PUBLIC COMPLAINT FILING": "PAGPASAKA OG REKLAMO SA PUBLIKO",
        "File a complaint": "Pagpasaka og Reklamo",
        "Provide the details of your concern so barangay personnel can conduct an initial review. You do not need a resident account to submit this form.":
            "Ihatag ang mga detalye sa imong reklamo aron masusi kini sa mga kawani sa barangay. Dili kinahanglan nga adunay resident account aron mapasa kini nga porma.",
        "Important:": "Importante:",
        "Submitting this form does not guarantee that your complaint will be accepted for Barangay Justice System proceedings. Your submission will be reviewed by authorized barangay personnel.":
            "Ang pagpasa niini nga porma dili garantiya nga dawaton ang imong reklamo alang sa proseso sa Barangay Justice System. Susihon kini sa awtorisadong mga kawani sa barangay.",
        "Preliminary jurisdiction screening": "Inisyal nga Pagsusi sa Hurisdiksyon",
        "These questions help determine whether your complaint may be handled through the Barangay Justice System.":
            "Kini nga mga pangutana makatabang sa pagtino kung ang imong reklamo mahimong dumalahon pinaagi sa Barangay Justice System.",
        "Please answer to the best of your knowledge. If you are unsure, choose \"Unsure.\" Barangay personnel will review your responses.":
            "Tubaga sumala sa imong nahibaloan. Kung dili ka sigurado, pilia ang \"Dili Sigurado.\" Susihon sa mga kawani sa barangay ang imong mga tubag.",
        "1. Is one of the parties the government, or a government subdivision or instrumentality?":
            "1. Usa ba sa mga partido ang gobyerno o usa ka departamento o ahensya niini?",
        "Examples include the Philippine National Police (PNP), Armed Forces of the Philippines (AFP), Department of Education (DepEd), Department of Health (DOH), Department of Social Welfare and Development (DSWD), and city or municipal governments. Answer Yes only when the government entity itself is a party to the dispute, not merely because a government employee is involved.":
            "Mga pananglitan niini ang Philippine National Police (PNP), Armed Forces of the Philippines (AFP), Department of Education (DepEd), Department of Health (DOH), Department of Social Welfare and Development (DSWD), ug mga lokal nga gobyerno. Tubaga og Oo lamang kung ang ahensya mismo kabahin sa panaglalis, dili tungod lang kay adunay empleyado sa gobyerno nga nalambigit.",
        "2. Does the dispute involve a public officer or employee in relation to their official functions?":
            "2. May kalabotan ba ang panaglalis sa usa ka opisyal o empleyado sa gobyerno ug sa iyang opisyal nga katungdanan?",
        "3. Does the offense potentially carry imprisonment exceeding one (1) year or a fine exceeding ₱5,000?":
            "3. Posible bang silotan ang kalapasan og kapin sa usa (1) ka tuig nga pagkabilanggo o multa nga molapas sa ₱5,000?",
        "4. Is there a private offended party?": "4. Aduna bay pribadong tawo nga naapektuhan o nabiktima?",
        "5. If the dispute involves real property, are the properties located in different cities or municipalities without agreement to submit to this Lupon?":
            "5. Kung ang panaglalis mahitungod sa yuta o propiedad, naa ba kini sa lain-laing siyudad o munisipyo nga walay kasabotan nga isumite ang panaglalis niini nga Lupon?",
        "6. Do the complainant and respondent live in different cities or municipalities where their barangays are not adjoining, or, if adjoining, do they not both agree to submit the dispute to this Lupon?":
            "6. Nagpuyo ba ang moreklamo ug ang gireklamohan sa lain-laing siyudad o munisipyo nga dili magkasikbit ang ilang mga barangay, o kung magkasikbit man, wala ba sila magkauyon nga isumite ang panaglalis niini nga Lupon?",
        "Select an answer": "Pagpili og tubag",
        "Yes": "Oo",
        "No": "Dili",
        "Unsure": "Dili Sigurado",
        "Not applicable (no criminal offense)": "Dili angay (walay kriminal nga kalapasan)",
        "Not applicable": "Dili angay",
        "Complete the preliminary screening to continue to the complaint information.":
            "Kompletoha ang inisyal nga pagsusi aron mopadayon sa impormasyon sa reklamo.",
        "Continue to Complaint Information": "Padayon sa Impormasyon sa Reklamo",
        "Complainant information": "Impormasyon sa Moreklamo",
        "Your personal information and contact details.": "Imong personal nga impormasyon ug mga detalye sa pagkontak.",
        "Full name": "Tibuok nga Ngalan",
        "Contact number": "Numero sa Kontak",
        "Email address": "Email Address",
        "Your case number and private tracking code will be sent to this email.":
            "Ipadala sa kini nga email ang imong numero sa kaso ug pribadong tracking code.",
        "Respondent information": "Impormasyon sa Gireklamohan",
        "Information about the person you are filing against.": "Impormasyon bahin sa tawo nga imong gireklamohan.",
        "Respondent's full name": "Tibuok nga Ngalan sa Gireklamohan",
        "Respondent's address": "Adres sa Gireklamohan",
        "House number, street, purok, or other known address": "Numero sa balay, dalan, purok, o laing nahibal-an nga adres",
        "Dispute details": "Mga Detalye sa Panaglalis",
        "Describe what happened and the nature of your concern.": "Ihulagway ang nahitabo ug ang kinaiya sa imong reklamo.",
        "Type of dispute": "Klase sa Panaglalis",
        "Select dispute type": "Pilia ang klase sa panaglalis",
        "Neighbor Dispute": "Panaglalis sa Silingan",
        "Noise Complaint": "Reklamo sa Kasaba",
        "Property Dispute": "Panaglalis sa Propiedad",
        "Boundary Dispute": "Panaglalis sa Utlanan sa Yuta",
        "Debt or Financial Dispute": "Panaglalis sa Utang o Kuwarta",
        "Family Dispute": "Panaglalis sa Pamilya",
        "Harassment": "Panghasi o Pagpanghadlok",
        "Physical Injury": "Pisikal nga Pagpasakit",
        "Other": "Uban pa",
        "Incident description": "Paghulagway sa Insidente",
        "Describe what happened, when it happened, where it happened, and any relevant details...":
            "Ihulagway kung unsay nahitabo, kanus-a ug asa kini nahitabo, ug uban pang importanteng detalye...",
        "Supporting Evidence (Optional)": "Mga Ebidensya nga Mosuporta (Opsyonal)",
        "Attach photos or documents that support your complaint. Accepted formats: JPG, PNG, and PDF. Maximum 5 files, 5 MB each.":
            "Idugang ang mga litrato o dokumento nga mosuporta sa imong reklamo. Gidawat nga format: JPG, PNG, ug PDF. Kutob sa 5 ka file, 5 MB matag usa.",
        "Please provide accurate details. Avoid including unrelated personal or sensitive information.":
            "Paghatag og tukmang mga detalye. Likayi ang paglakip og personal o sensitibong impormasyon nga walay kalabotan.",
        "Residence information": "Impormasyon sa Puloy-anan",
        "Where you and the respondent currently reside.": "Asa nagpuyo karon ikaw ug ang gireklamohan.",
        "Your city / municipality": "Imong Siyudad / Munisipyo",
        "Your barangay": "Imong Barangay",
        "Respondent's city / municipality": "Siyudad / Munisipyo sa Gireklamohan",
        "Respondent's barangay": "Barangay sa Gireklamohan",
        "By submitting this form, you confirm that the information provided is accurate to the best of your knowledge and consent to its use by authorized barangay personnel for complaint processing.":
            "Pinaagi sa pagpasa niini nga porma, imong gipamatud-an nga tukma ang impormasyon sumala sa imong nahibaloan ug mouyon ka nga gamiton kini sa awtorisadong mga kawani sa barangay alang sa pagproseso sa reklamo.",
        "Submit Complaint": "Ipasa ang Reklamo",
        "Cancel and return home": "Kanselahon ug Balik sa Panid sa Puy-anan",
        "Leave this field empty": "Pasagdi nga walay sulod kini nga bahin"
    };

    let currentLanguage = "en";
    const originalTextNodes = new Map();
    const originalAttributes = new Map();

    function applyPageLanguage(language) {
        const useCebuano = language === "ceb";
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                    if (node.parentElement?.closest("script, style")) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let node;
        while ((node = walker.nextNode())) {
            if (!originalTextNodes.has(node)) {
                originalTextNodes.set(node, node.nodeValue);
            }

            const original = originalTextNodes.get(node);
            const key = original.trim();

            if (useCebuano && cebuanTranslations[key]) {
                const leading = original.match(/^\s*/)?.[0] || "";
                const trailing = original.match(/\s*$/)?.[0] || "";
                node.nodeValue = leading + cebuanTranslations[key] + trailing;
            } else {
                node.nodeValue = original;
            }
        }

        const attributeNames = ["placeholder", "aria-label", "title"];

        document.querySelectorAll("input, textarea, button, a").forEach((element) => {
            attributeNames.forEach((attribute) => {
                if (!element.hasAttribute(attribute)) return;

                const mapKey = `${attribute}`;

                if (!originalAttributes.has(element)) {
                    originalAttributes.set(element, {});
                }

                if (!(mapKey in originalAttributes.get(element))) {
                    originalAttributes.get(element)[mapKey] = element.getAttribute(attribute);
                }

                const original = originalAttributes.get(element)[mapKey];

                if (useCebuano && cebuanTranslations[original]) {
                    element.setAttribute(attribute, cebuanTranslations[original]);
                } else {
                    element.setAttribute(attribute, original);
                }
            });
        });

        // Translate select options while preserving their submitted values.
        document.querySelectorAll("select option").forEach((option) => {
            if (!option.dataset.originalLabel) {
                option.dataset.originalLabel = option.textContent;
            }

            const original = option.dataset.originalLabel.trim();

            option.textContent = useCebuano && cebuanTranslations[original]
                ? cebuanTranslations[original]
                : option.dataset.originalLabel;
        });

        if (languageToggleButton) {
            languageToggleButton.textContent = useCebuano ? "English" : "Cebuano";
            languageToggleButton.setAttribute("aria-pressed", String(useCebuano));
            languageToggleButton.setAttribute(
                "aria-label",
                useCebuano ? "Switch language to English" : "Switch language to Cebuano"
            );
        }

        currentLanguage = language;
    }

    if (languageToggleButton) {
        languageToggleButton.addEventListener("click", () => {
            applyPageLanguage(currentLanguage === "en" ? "ceb" : "en");
        });
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
        if (currentLanguage === "ceb") {
            const dynamicTranslations = {
                "You can upload a maximum of 5 evidence files.": "Kutob ra sa 5 ka ebidensya nga file ang mahimong i-upload.",
                "is not an allowed file type.": "dili tugot nga klase sa file.",
                "exceeds the 5 MB file size limit.": "milapas sa limit nga 5 MB.",
                "Unable to connect to the LuponResolve server. Please check your internet connection and try again.":
                    "Dili makakonekta sa server sa LuponResolve. Susiha ang imong internet connection ug sulayi pag-usab.",
                "Your complaint could not be submitted. Please review your information and try again.":
                    "Dili mapasa ang imong reklamo. Susiha ang imong impormasyon ug sulayi pag-usab."
            };

            message = dynamicTranslations[message] || message;
        }

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

    function getScreeningBlockReason(includeResidenceCheck = true) {

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
            return null;
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
            includeResidenceCheck &&
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
        heading.textContent = currentLanguage === "ceb"
            ? "Dili Makapadayon ang Reklamo"
            : "Complaint Cannot Proceed";

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

        reviewButton.textContent = currentLanguage === "ceb"
            ? "Usisaa ang Akong mga Tubag"
            : "Review My Answers";

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
    // SCREENING-FIRST FLOW
    // ======================================

    const screeningSection = document.getElementById("screeningSection");
    const screeningContinueSection = document.getElementById("screeningContinueSection");
    const continueToComplaintButton = document.getElementById("continueToComplaintBtn");
    const complaintDetailsSection = document.getElementById("complaintDetailsSection");

    if (
        screeningSection &&
        screeningContinueSection &&
        continueToComplaintButton &&
        complaintDetailsSection
    ) {
        continueToComplaintButton.addEventListener("click", () => {
            clearMessage();

            // Validate only the screening questions at this stage.
            const screeningFieldNames = [
                "governmentParty",
                "publicOfficial",
                "penaltyThreshold",
                "privateOffendedParty",
                "realPropertyException",
                "differentMunicipalitiesException"
            ];

            for (const fieldName of screeningFieldNames) {
                const field = form.elements[fieldName];

                if (field && !field.checkValidity()) {
                    field.reportValidity();
                    field.focus();
                    return;
                }
            }

            // Municipality details are collected in the next step,
            // so territorial screening is deferred until final submission.
            const screeningBlock = getScreeningBlockReason(false);

            if (screeningBlock) {
                showJurisdictionWarning(screeningBlock);
                return;
            }

            screeningSection.hidden = true;
            screeningContinueSection.hidden = true;
            continueToComplaintButton.remove();
            complaintDetailsSection.hidden = false;

            const firstDetailsSection =
                complaintDetailsSection.querySelector(".form-section");

            if (firstDetailsSection) {
                firstDetailsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
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
        submitButton.textContent = currentLanguage === "ceb"
            ? "Gipasa ang reklamo..."
            : "Submitting complaint...";

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

            if (evidenceFileList) {
                evidenceFileList.innerHTML = "";
            }

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