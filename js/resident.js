
// =====================================
// LUPONRESOLVE - RESIDENT PORTAL
// WITH PRELIMINARY JURISDICTION SCREENING
// =====================================


// 1. GET HTML ELEMENTS

const navigationLinks = document.querySelectorAll(".nav-link");
const pageSections = document.querySelectorAll(".page-section");

const pageTitle = document.getElementById("pageTitle");
const breadcrumbPage = document.getElementById("breadcrumbPage");

const complaintForm = document.getElementById("complaintForm");
const formMessage = document.getElementById("formMessage");
const screeningResult = document.getElementById("screeningResult");

const totalCasesElement = document.getElementById("totalCases");
const pendingCasesElement = document.getElementById("pendingCases");
const resolvedCasesElement = document.getElementById("resolvedCases");

const recentCasesElement = document.getElementById("recentCases");
const allCasesElement = document.getElementById("allCases");


// 2. LOAD CASES FROM BACKEND

let cases = [];

async function loadCases() {

    try {

        const response = await fetch(
            window.API.cases,
            {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load cases."
            );
        }

        // Convert backend case data into the format
        // expected by the Resident Dashboard.

        cases = data.cases.map(item => ({

            caseId: item.caseNumber,

            complainantName: item.complainantName,

            respondentName: item.respondentName,

            disputeType: item.disputeType,

            incidentDetails: item.incidentDetails,

            status: item.status,

            caseStage: item.caseStage,

            screeningStatus: item.screeningStatus,

            screeningReasons: item.screeningReasons,

            screeningWarnings: item.screeningWarnings,

            screeningAnswers: item.screeningAnswers,

            dateSubmitted: item.createdAt
                ? new Date(
                    item.createdAt.replace(" ", "T")
                ).toLocaleDateString()
                : "Unknown"

        }));

        console.log("Cases loaded from backend:", cases);

        renderCases();

    } catch (error) {

        console.error("Unable to load backend cases:", error);

        cases = [];

        renderCases();

    }

}

// 4. NAVIGATION

function showSection(sectionId) {

    pageSections.forEach(section => {
        section.classList.remove("active");
    });

    navigationLinks.forEach(link => {
        link.classList.remove("active");
    });

    const selectedSection = document.getElementById(sectionId);

    if (!selectedSection) {
        return;
    }

    selectedSection.classList.add("active");

    const selectedLink = document.querySelector(
        `.nav-link[data-section="${sectionId}"]`
    );

    if (selectedLink) {
        selectedLink.classList.add("active");
    }

    const titles = {
        dashboard: "Dashboard",
        submit: "Submit Complaint",
        cases: "My Cases",
        profile: "My Profile"
    };

    pageTitle.textContent = titles[sectionId];
    breadcrumbPage.textContent = titles[sectionId];

    window.location.hash = sectionId;
}


navigationLinks.forEach(link => {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        showSection(this.dataset.section);

    });

});


document.querySelectorAll("[data-go]").forEach(button => {

    button.addEventListener("click", function() {

        showSection(this.dataset.go);

    });

});


// 5. DISPLAY CASES

function renderCases() {

    const total = cases.length;

    const pending = cases.filter(
        complaint => complaint.status === "Pending Review"
    ).length;

    const resolved = cases.filter(
    complaint => [
        "Resolved",
        "Certificate to File Action",
        "Closed"
        ].includes(complaint.caseStage)
    ).length;

    totalCasesElement.textContent = total;
    pendingCasesElement.textContent = pending;
    resolvedCasesElement.textContent = resolved;

    const recentCases = cases.slice(-3).reverse();

    displayCaseList(recentCases, recentCasesElement);

    displayCaseList([...cases].reverse(), allCasesElement);
}


// 6. SAFELY DISPLAY USER-PROVIDED TEXT

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => {

        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];

    });

}


// 7. DISPLAY CASE LIST

function displayCaseList(caseList, container) {

    if (caseList.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">▤</div>
                <h3>No cases found</h3>
                <p>Your submitted complaints will appear here.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = caseList.map(complaint => {

        const finalStages = [
            "Resolved",
            "Certificate to File Action",
            "Closed"
        ];

        const displayStatus = finalStages.includes(complaint.caseStage)
            ? complaint.caseStage
            : complaint.status;

        const statusClass = finalStages.includes(complaint.caseStage)
            ? "resolved"
            : "pending";

        return `
            <article class="case-item">
                <div>
                    <h3>${escapeHTML(complaint.disputeType)}</h3>

                    <p>
                        Case ID: ${escapeHTML(complaint.caseId)}
                    </p>

                    <p>
                        Respondent: ${escapeHTML(complaint.respondentName)}
                    </p>

                    <p>
                        Submitted: ${escapeHTML(complaint.dateSubmitted)}
                    </p>

                    <p>
                        Screening: ${escapeHTML(complaint.screeningStatus)}
                    </p>
                </div>

                <span class="case-status ${statusClass}">
                    ${escapeHTML(displayStatus)}
                </span>
            </article>
        `;

    }).join("");

}


// =====================================
// 8. PRELIMINARY JURISDICTION SCREENING
// =====================================

function getScreeningAnswers() {

    return {

        complainantMunicipality:
            document.getElementById("complainantMunicipality").value.trim(),

        complainantBarangay:
            document.getElementById("complainantBarangay").value.trim(),

        respondentMunicipality:
            document.getElementById("respondentMunicipality").value.trim(),

        respondentBarangay:
            document.getElementById("respondentBarangay").value.trim(),

        governmentParty:
            document.getElementById("governmentParty").value,

        publicOfficial:
            document.getElementById("publicOfficial").value,

        criminalOffense:
            document.getElementById("criminalOffense").value,

        penaltyThreshold:
            document.getElementById("penaltyThreshold").value,

        privateOffendedParty:
            document.getElementById("privateOffendedParty").value,

        realPropertyDispute:
            document.getElementById("realPropertyDispute").value,

        propertyDifferentCities:
            document.getElementById("propertyDifferentCities").value,

        propertyPartiesAgree:
            document.getElementById("propertyPartiesAgree").value,

        barangaysAdjoining:
            document.getElementById("barangaysAdjoining").value,

        partiesAgree:
            document.getElementById("partiesAgree").value,

        otherException:
            document.getElementById("otherException").value

    };

}


// Compare place names without case or extra-space differences
function normalizePlace(value) {

    return value.trim().replace(/\s+/g, " ").toLowerCase();

}


// Evaluate the resident's answers
function screenComplaint(answers) {

    const reasons = [];
    const warnings = [];

    let excluded = false;
    let needsReview = false;


    // RULE 1: Government party
    // RA 7160 Section 408(a)

    if (answers.governmentParty === "yes") {

        excluded = true;

        reasons.push(
            "One party is identified as the government or one of its subdivisions or instrumentalities."
        );

    } else if (answers.governmentParty === "unsure") {

        needsReview = true;

        warnings.push(
            "Government involvement needs verification."
        );

    }


    // RULE 2: Public officer performing official functions
    // RA 7160 Section 408(b)

    if (answers.publicOfficial === "yes") {

        excluded = true;

        reasons.push(
            "The dispute is identified as involving a public officer or employee in relation to official functions."
        );

    } else if (answers.publicOfficial === "unsure") {

        needsReview = true;

        warnings.push(
            "The nature of any public officer's involvement needs review."
        );

    }


    // RULE 3: Criminal offense and penalty threshold
    // RA 7160 Section 408(c)

    if (answers.criminalOffense === "yes") {

        if (answers.penaltyThreshold === "yes") {

            excluded = true;

            reasons.push(
                "The stated possible penalty exceeds one year of imprisonment or a fine of ₱5,000."
            );

        } else if (answers.penaltyThreshold === "unsure") {

            needsReview = true;

            warnings.push(
                "The applicable penalty needs legal verification."
            );

        } else if (answers.penaltyThreshold === "not_applicable") {

            needsReview = true;

            warnings.push(
                "A criminal offense was indicated, but its penalty was marked not applicable."
            );

        }

        // RULE 4: No private offended party
        // RA 7160 Section 408(d)

        if (answers.privateOffendedParty === "no") {

            excluded = true;

            reasons.push(
                "The answer indicates that the alleged offense has no private offended party."
            );

        } else if (answers.privateOffendedParty === "unsure") {

            needsReview = true;

            warnings.push(
                "It needs to be established whether there is a private offended party."
            );

        } else if (answers.privateOffendedParty === "not_applicable") {

            needsReview = true;

            warnings.push(
                "The private-offended-party question was marked not applicable despite a criminal offense being indicated."
            );

        }

    } else if (answers.criminalOffense === "no") {

        if (
            answers.penaltyThreshold !== "not_applicable" ||
            answers.privateOffendedParty !== "not_applicable"
        ) {

            needsReview = true;

            warnings.push(
                "Some criminal-offense questions have answers inconsistent with the stated absence of a criminal offense."
            );

        }

    } else {

        needsReview = true;

        warnings.push(
            "It is unclear whether the complaint involves a criminal offense."
        );

    }


    // RULE 5: Real property in different cities or municipalities
    // RA 7160 Section 408(e)

    if (answers.realPropertyDispute === "yes") {

        if (answers.propertyDifferentCities === "yes") {

            if (answers.propertyPartiesAgree === "no") {

                excluded = true;

                reasons.push(
                    "The real properties are in different cities or municipalities and the parties do not agree to submit the dispute to an appropriate Lupon."
                );

            } else if (answers.propertyPartiesAgree === "unsure") {

                needsReview = true;

                warnings.push(
                    "Agreement of the parties concerning real property in different cities or municipalities needs verification."
                );

            } else if (answers.propertyPartiesAgree === "not_applicable") {

                needsReview = true;

                warnings.push(
                    "The property agreement question needs clarification."
                );

            }

        } else if (answers.propertyDifferentCities === "unsure") {

            needsReview = true;

            warnings.push(
                "The locations of the real properties need verification."
            );

        } else if (answers.propertyDifferentCities === "not_applicable") {

            needsReview = true;

            warnings.push(
                "The property-location question needs clarification."
            );

        }

    } else if (answers.realPropertyDispute === "unsure") {

        needsReview = true;

        warnings.push(
            "It needs to be established whether the dispute involves real property."
        );

    } else if (answers.realPropertyDispute === "no") {

        if (answers.propertyDifferentCities !== "not_applicable" ||
            answers.propertyPartiesAgree !== "not_applicable") {

            needsReview = true;

            warnings.push(
                "Property-related answers need clarification because no real-property dispute was indicated."
            );

        }

    }


    // RULE 6: Parties residing in different cities or municipalities
    // RA 7160 Section 408(f)

    const sameMunicipality =
        normalizePlace(answers.complainantMunicipality) ===
        normalizePlace(answers.respondentMunicipality);

    if (!sameMunicipality) {

        if (answers.barangaysAdjoining === "no") {

            excluded = true;

            reasons.push(
                "The parties reside in different cities or municipalities whose barangays are indicated as non-adjoining."
            );

        } else if (answers.barangaysAdjoining === "yes") {

            if (answers.partiesAgree === "no") {

                excluded = true;

                reasons.push(
                    "The parties reside in different cities or municipalities and do not both agree to submit the dispute to an appropriate Lupon."
                );

            } else if (answers.partiesAgree === "unsure") {

                needsReview = true;

                warnings.push(
                    "Agreement of both parties needs verification."
                );

            } else if (answers.partiesAgree === "not_applicable") {

                needsReview = true;

                warnings.push(
                    "The parties' agreement needs clarification."
                );

            }

        } else if (answers.barangaysAdjoining === "unsure") {

            needsReview = true;

            warnings.push(
                "It needs to be verified whether the barangays in the different cities or municipalities adjoin each other."
            );

        } else if (answers.barangaysAdjoining === "not_applicable") {

            needsReview = true;

            warnings.push(
                "The adjoining-barangay question needs clarification."
            );

        }

    } else {

        // Same city or municipality:
        // Different barangays may affect venue under Section 409,
        // but do not automatically exclude the dispute.

        if (
            normalizePlace(answers.complainantBarangay) !==
            normalizePlace(answers.respondentBarangay)
        ) {

            warnings.push(
                "The parties report different barangays within the same city or municipality. Venue should be checked under Section 409."
            );

        }

    }


    // RULE 7: Other possible legal exclusions
    // Section 408(g) and other applicable laws

    if (answers.otherException === "yes") {

        needsReview = true;

        warnings.push(
            "The resident identified another possible legal exclusion. Staff review is required."
        );

    } else if (answers.otherException === "unsure") {

        needsReview = true;

        warnings.push(
            "Other possible legal exclusions have not been ruled out."
        );

    }


    // FINAL SCREENING RESULT

    if (excluded) {

        return {

            status: "Potentially Outside KP Jurisdiction",

            category: "excluded",

            reasons: reasons,

            warnings: warnings

        };

    }

    if (needsReview) {

        return {

            status: "Requires Barangay Staff Review",

            category: "review",

            reasons: reasons,

            warnings: warnings

        };

    }

    return {

        status: "Potentially Eligible for KP Review",

        category: "eligible",

        reasons: [],

        warnings: warnings

    };

}


// 9. DISPLAY SCREENING RESULT

function displayScreeningResult(result) {

    screeningResult.hidden = false;

    screeningResult.className =
        `screening-result ${result.category}`;

    let explanation = "";

    if (result.reasons.length > 0) {

        explanation += `
            <h4>Screening observations</h4>
            <ul>
                ${result.reasons.map(reason =>
                    `<li>${escapeHTML(reason)}</li>`
                ).join("")}
            </ul>
        `;

    }

    if (result.warnings.length > 0) {

        explanation += `
            <h4>Additional notes</h4>
            <ul>
                ${result.warnings.map(warning =>
                    `<li>${escapeHTML(warning)}</li>`
                ).join("")}
            </ul>
        `;

    }

    if (result.category === "eligible") {

        explanation += `
            <p>
                Your answers did not identify any of the specific
                Section 408 exclusions checked by this prototype.
                Barangay personnel must still verify the complaint,
                venue, facts, and applicable laws.
            </p>
        `;

    }

    if (result.category === "review") {

        explanation += `
            <p>
                Some answers are uncertain or require additional
                legal or factual verification. Please wait for
                barangay personnel to review your complaint.
            </p>
        `;

    }

    if (result.category === "excluded") {

        explanation += `
            <p>
                Your answers indicate a possible Section 408
                exception. This is not a final legal determination.
                Please seek guidance from the appropriate office
                about the proper next step.
            </p>
        `;

    }

    screeningResult.innerHTML = `
        <h3>${escapeHTML(result.status)}</h3>
        ${explanation}
        <p class="screening-disclaimer">
            Preliminary automated screening only. Not legal advice
            and not an official barangay decision.
        </p>
    `;

}


// =====================================
// 10. HANDLE COMPLAINT SUBMISSION
// =====================================

complaintForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    formMessage.textContent = "";
    formMessage.className = "form-message";


    // Collect complaint information

    const complainantName =
        document.getElementById("complainantName").value.trim();

    const complainantEmail =
        document.getElementById("complainantEmail").value.trim();

    const complainantContact =
        document.getElementById("complainantContact").value.trim();

    const respondentName =
        document.getElementById("respondentName").value.trim();

    const respondentAddress =
        document.getElementById("respondentAddress").value.trim();

    const respondentEmail =
        document.getElementById("respondentEmail").value.trim();

    const disputeType =
        document.getElementById("disputeType").value;

    const incidentDetails =
        document.getElementById("incidentDetails").value.trim();


    // Collect screening information

    const screeningAnswers = getScreeningAnswers();


    // Basic required-field validation

    const requiredScreeningAnswers = Object.values(screeningAnswers);

    if (
            !complainantName ||
            !complainantContact ||
            !complainantEmail ||
            !respondentName ||
            !disputeType ||
            !incidentDetails ||
            requiredScreeningAnswers.some(answer => !answer)
        ) {
        formMessage.textContent =
            "Please complete all required complaint and screening fields.";

        formMessage.className = "form-message error";

        return;

    }


    // Check contradictory answers before screening

    if (
        screeningAnswers.criminalOffense === "no" &&
        (
            screeningAnswers.penaltyThreshold !== "not_applicable" ||
            screeningAnswers.privateOffendedParty !== "not_applicable"
        )
    ) {

        formMessage.textContent =
            "Please select 'Not applicable' for the criminal-offense follow-up questions when no criminal offense is involved.";

        formMessage.className = "form-message error";

        return;

    }


    if (
        screeningAnswers.realPropertyDispute === "no" &&
        (
            screeningAnswers.propertyDifferentCities !== "not_applicable" ||
            screeningAnswers.propertyPartiesAgree !== "not_applicable"
        )
    ) {

        formMessage.textContent =
            "Please select 'Not applicable' for the property follow-up questions when no real-property dispute is involved.";

        formMessage.className = "form-message error";

        return;

    }


    // Perform preliminary screening

    const screening = screenComplaint(screeningAnswers);


    // Show the screening result

    displayScreeningResult(screening);


    // Create complaint object

    const complaint = {

        caseId: "LR-" + Date.now(),

        complainantName: complainantName,

        complainantContact: complainantContact,

        complainantEmail: complainantEmail,

        respondentName: respondentName,

        respondentAddress: respondentAddress,

        respondentEmail: respondentEmail,

        disputeType: disputeType,

        incidentDetails: incidentDetails,

        screeningAnswers: screeningAnswers,

        screeningStatus: screening.status,

        screeningReasons: screening.reasons,

        screeningWarnings: screening.warnings,

        // All submitted complaints remain pending staff review.
        // Screening does not automatically accept or reject a case.

        status: "Pending Review",

        dateSubmitted: new Date().toLocaleDateString()

    };


    // Save complaint to demo storage

    // Save complaint through the backend API

        try {

        const response = await fetch(
            window.API.cases,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    complainantName: complaint.complainantName,
                    complainantEmail: complaint.complainantEmail,
                    respondentName: complaint.respondentName,
                    respondentAddress: complaint.respondentAddress,
                    respondentEmail: complaint.respondentEmail,
                    disputeType: complaint.disputeType,
                    incidentDetails: complaint.incidentDetails,

                    screeningAnswers: complaint.screeningAnswers,
                    screeningStatus: complaint.screeningStatus,
                    screeningReasons: complaint.screeningReasons,
                    screeningWarnings: complaint.screeningWarnings
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Unable to submit complaint."
            );

        }

        // Temporarily update the current dashboard.
        // We will load the official database records in our next step.

        await loadCases();

        } catch (error) {

            console.error("Complaint submission error:", error);

            formMessage.textContent =
                error.message || "Unable to connect to the server.";

            formMessage.className = "form-message error";

            return;

        }


    // Refresh dashboard

    renderCases();


    // Display confirmation

    formMessage.textContent =
        "Complaint saved. Your preliminary screening result is: " +
        screening.status +
        ". This complaint is awaiting barangay staff review.";

    formMessage.className = "form-message success";


    // Clear form after successful save

    complaintForm.reset();


    // Return to dashboard

    showSection("dashboard");

});


// =====================================
// 11. INITIALIZE DASHBOARD
// =====================================

loadCases();

const initialSection = window.location.hash.replace("#", "");

const validSections = [
    "dashboard",
    "submit",
    "cases",
    "profile"
];

if (validSections.includes(initialSection)) {

    showSection(initialSection);

} else {

    showSection("dashboard");

}
