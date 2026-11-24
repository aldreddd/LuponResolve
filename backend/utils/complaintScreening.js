
// ======================================
// LUPONRESOLVE — SERVER-SIDE COMPLAINT SCREENING
// ======================================

function normalizePlace(value) {
    return String(value || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}

function normalizeAnswer(value) {
    if (typeof value !== "string") {
        return value;
    }

    return value.trim().toLowerCase();
}

function reviewResult(warnings = []) {
    return {
        status: "Requires Barangay Staff Review",
        category: "review",
        reasons: [],
        warnings
    };
}

// ======================================
// VALIDATE SCREENING ANSWERS
// ======================================

function validateAnswers(answers) {
    if (
        answers === null ||
        typeof answers !== "object" ||
        Array.isArray(answers)
    ) {
        return {
            valid: false,
            warnings: [
                "Screening answers are missing or have an invalid format."
            ]
        };
    }

    const normalized = { ...answers };
    const warnings = [];

    const locationFields = [
        "complainantMunicipality",
        "complainantBarangay",
        "respondentMunicipality",
        "respondentBarangay"
    ];

    for (const field of locationFields) {
        if (
            typeof normalized[field] !== "string" ||
            normalized[field].trim() === "" ||
            normalized[field].length > 200
        ) {
            warnings.push(
                `The required location field "${field}" is missing or invalid.`
            );
        } else {
            normalized[field] = normalized[field]
                .trim()
                .replace(/\s+/g, " ");
        }
    }

    const answerFields = {
        governmentParty: ["yes", "no", "unsure"],

        publicOfficial: ["yes", "no", "unsure"],

        penaltyThreshold: [
            "yes",
            "no",
            "unsure",
            "not_applicable"
        ],

        privateOffendedParty: [
            "yes",
            "no",
            "unsure",
            "not_applicable"
        ],

        realPropertyException: [
            "yes",
            "no",
            "unsure"
        ],

        differentMunicipalitiesException: [
            "yes",
            "no",
            "unsure"
        ]
    };

    for (const [field, allowedValues] of Object.entries(answerFields)) {
        const value = normalized[field];

        if (typeof value !== "string") {
            warnings.push(
                `The required screening answer "${field}" is missing or invalid.`
            );
            continue;
        }

        const cleanValue = normalizeAnswer(value);

        normalized[field] = cleanValue;

        if (!allowedValues.includes(cleanValue)) {
            warnings.push(
                `The screening answer "${field}" contains an unrecognized value.`
            );
        }
    }

    return {
        valid: warnings.length === 0,
        normalized,
        warnings
    };
}

// ======================================
// MAIN SCREENING FUNCTION
// ======================================

function screenComplaint(answers) {

    const validation = validateAnswers(answers);

    if (!validation.valid) {
        return reviewResult(validation.warnings);
    }

    answers = validation.normalized;

    const reasons = [];
    const warnings = [];

    let excluded = false;
    let needsReview = false;

    // ======================================
    // RULE 1: GOVERNMENT PARTY
    // RA 7160, SECTION 408(a)
    // ======================================

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

    // ======================================
    // RULE 2: PUBLIC OFFICIAL
    // RA 7160, SECTION 408(b)
    // ======================================

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

    // ======================================
    // RULES 3 & 4: CRIMINAL OFFENSE
    // RA 7160, SECTION 408(c) AND (d)
    // ======================================

    const penaltyAnswer = answers.penaltyThreshold;
    const privatePartyAnswer = answers.privateOffendedParty;

    if (penaltyAnswer === "not_applicable") {

        // Not applicable means no criminal offense
        // is being reported for this screening question.

        if (privatePartyAnswer !== "not_applicable") {
            needsReview = true;

            warnings.push(
                "The penalty question was marked not applicable, but the private-offended-party answer was not. Please clarify."
            );
        }

    } else {

        // A penalty answer of YES indicates that the
        // possible penalty exceeds the stated threshold.

        if (penaltyAnswer === "yes") {
            excluded = true;

            reasons.push(
                "The stated possible penalty exceeds one year of imprisonment or a fine of ₱5,000."
            );
        } else if (penaltyAnswer === "unsure") {
            needsReview = true;

            warnings.push(
                "The applicable penalty needs legal verification."
            );
        }

        // Check whether a private offended party exists.

        if (privatePartyAnswer === "no") {
            excluded = true;

            reasons.push(
                "The answer indicates that the alleged offense has no private offended party."
            );
        } else if (privatePartyAnswer === "unsure") {
            needsReview = true;

            warnings.push(
                "It needs to be established whether there is a private offended party."
            );
        } else if (privatePartyAnswer === "not_applicable") {
            needsReview = true;

            warnings.push(
                "The private-offended-party question was marked not applicable despite a criminal-offense penalty answer being provided."
            );
        }
    }

    // ======================================
    // RULE 5: REAL PROPERTY
    // RA 7160, SECTION 408(e)
    // ======================================

    if (answers.realPropertyException === "yes") {
        excluded = true;

        reasons.push(
            "The real properties are located in different cities or municipalities and the parties do not agree to submit the dispute to this Lupon."
        );
    } else if (answers.realPropertyException === "unsure") {
        needsReview = true;

        warnings.push(
            "The location of the real properties or the parties' agreement needs verification."
        );
    }

    // ======================================
    // RULE 6: DIFFERENT CITIES / MUNICIPALITIES
    // RA 7160, SECTION 408(f)
    // ======================================

    const sameMunicipality =
        normalizePlace(answers.complainantMunicipality) ===
        normalizePlace(answers.respondentMunicipality);

    const sameBarangay =
        normalizePlace(answers.complainantBarangay) ===
        normalizePlace(answers.respondentBarangay);

    if (answers.differentMunicipalitiesException === "yes") {

        if (sameMunicipality) {
            needsReview = true;

            warnings.push(
                "The answer indicates a different-city or municipality exception, but the supplied municipality names are the same. Staff verification is required."
            );
        } else {
            excluded = true;

            reasons.push(
                "The parties reside in different cities or municipalities where their barangays are not adjoining, or they do not both agree to submit the dispute to this Lupon."
            );
        }

    } else if (
        answers.differentMunicipalitiesException === "unsure"
    ) {
        needsReview = true;

        warnings.push(
            "The relationship between the parties' barangays or their agreement to submit the dispute needs verification."
        );
    }

    // Same municipality but different barangays:
    // retain the existing venue warning.

    if (sameMunicipality && !sameBarangay) {
        warnings.push(
            "The parties report different barangays within the same city or municipality. Venue should be checked under Section 409."
        );
    }

    // ======================================
    // FINAL SCREENING RESULT
    // ======================================

    // An identified exclusion takes priority
    // over a staff-review warning.

    if (excluded) {
        return {
            status: "Potentially Outside KP Jurisdiction",
            category: "excluded",
            reasons,
            warnings
        };
    }

    if (needsReview) {
        return {
            status: "Requires Barangay Staff Review",
            category: "review",
            reasons,
            warnings
        };
    }

    return {
        status: "Potentially Eligible for KP Review",
        category: "eligible",
        reasons: [],
        warnings
    };
}

module.exports = screenComplaint;
