// ======================================
// LUPONRESOLVE — SERVER-SIDE COMPLAINT SCREENING
// ======================================

// Normalize municipality/barangay names.
function normalizePlace(value) {
    return String(value || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}

// Normalize string answers such as " YES " to "yes".
function normalizeAnswer(value) {
    if (typeof value !== "string") {
        return value;
    }

    return value.trim().toLowerCase();
}

// Return a consistent staff-review result for invalid or incomplete input.
function reviewResult(warnings = []) {
    return {
        status: "Requires Barangay Staff Review",
        category: "review",
        reasons: [],
        warnings
    };
}

// Validate and normalize answers before applying screening rules.
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

    // Required location fields.
    const locationFields = [
        "complainantMunicipality",
        "complainantBarangay",
        "respondentMunicipality",
        "respondentBarangay"
    ];

    for (const field of locationFields) {
        if (
            typeof normalized[field] !== "string" ||
            normalized[field].trim() === ""
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

    // Allowed answers for each screening field.
    const answerFields = {
        governmentParty: ["yes", "no", "unsure"],
        publicOfficial: ["yes", "no", "unsure"],

        criminalOffense: ["yes", "no", "unsure"],
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

        realPropertyDispute: ["yes", "no", "unsure"],
        propertyDifferentCities: [
            "yes",
            "no",
            "unsure",
            "not_applicable"
        ],
        propertyPartiesAgree: [
            "yes",
            "no",
            "unsure",
            "not_applicable"
        ],

        barangaysAdjoining: [
            "yes",
            "no",
            "unsure",
            "not_applicable"
        ],
        partiesAgree: [
            "yes",
            "no",
            "unsure",
            "not_applicable"
        ],

        otherException: ["yes", "no", "unsure"]
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

function screenComplaint(answers) {
    // ======================================
    // VALIDATION FIRST
    // ======================================

    const validation = validateAnswers(answers);

    if (!validation.valid) {
        return reviewResult(validation.warnings);
    }

    // Use normalized answers from this point forward.
    answers = validation.normalized;

    const reasons = [];
    const warnings = [];

    let excluded = false;
    let needsReview = false;

    // ======================================
    // RULE 1: Government party — Sec. 408(a)
    // ======================================

    if (answers.governmentParty === "yes") {
        excluded = true;
        reasons.push(
            "One party is identified as the government or one of its subdivisions or instrumentalities."
        );
    } else if (answers.governmentParty === "unsure") {
        needsReview = true;
        warnings.push("Government involvement needs verification.");
    }

    // ======================================
    // RULE 2: Public officer — Sec. 408(b)
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
    // RULE 3 & 4: Criminal offense
    // Sec. 408(c) and (d)
    // ======================================

    if (answers.criminalOffense === "yes") {
        if (answers.penaltyThreshold === "yes") {
            excluded = true;
            reasons.push(
                "The stated possible penalty exceeds one year of imprisonment or a fine of ₱5,000."
            );
        } else if (answers.penaltyThreshold === "unsure") {
            needsReview = true;
            warnings.push("The applicable penalty needs legal verification.");
        } else if (answers.penaltyThreshold === "not_applicable") {
            needsReview = true;
            warnings.push(
                "A criminal offense was indicated, but its penalty was marked not applicable."
            );
        }

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

    // ======================================
    // RULE 5: Real property — Sec. 408(e)
    // ======================================

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
            } else if (
                answers.propertyPartiesAgree === "not_applicable"
            ) {
                needsReview = true;
                warnings.push(
                    "The property agreement question needs clarification."
                );
            }
        } else if (answers.propertyDifferentCities === "no") {
            if (answers.propertyPartiesAgree !== "not_applicable") {
                needsReview = true;
                warnings.push(
                    "The properties were indicated as being in the same city or municipality, but the agreement question should be marked not applicable."
                );
            }
        } else if (
            answers.propertyDifferentCities === "unsure" ||
            answers.propertyDifferentCities === "not_applicable"
        ) {
            needsReview = true;
            warnings.push(
                "The locations of the real properties need verification."
            );
        }
    } else if (answers.realPropertyDispute === "unsure") {
        needsReview = true;
        warnings.push(
            "It needs to be established whether the dispute involves real property."
        );
    } else if (answers.realPropertyDispute === "no") {
        if (
            answers.propertyDifferentCities !== "not_applicable" ||
            answers.propertyPartiesAgree !== "not_applicable"
        ) {
            needsReview = true;
            warnings.push(
                "Property-related answers need clarification because no real-property dispute was indicated."
            );
        }
    }

    // ======================================
    // RULE 6: Different municipalities
    // Sec. 408(f)
    // ======================================

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
                warnings.push("Agreement of both parties needs verification.");
            } else if (
                answers.partiesAgree === "not_applicable"
            ) {
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
        } else if (
            answers.barangaysAdjoining === "not_applicable"
        ) {
            needsReview = true;
            warnings.push(
                "The adjoining-barangay question needs clarification."
            );
        }
    } else {
        if (
            normalizePlace(answers.complainantBarangay) !==
            normalizePlace(answers.respondentBarangay)
        ) {
            warnings.push(
                "The parties report different barangays within the same city or municipality. Venue should be checked under Section 409."
            );
        }
    }

    // ======================================
    // RULE 7: Other possible exclusions
    // ======================================

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

    // ======================================
    // FINAL RESULT
    // ======================================

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