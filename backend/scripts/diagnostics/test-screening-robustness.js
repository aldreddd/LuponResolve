const screenComplaint = require("../../utils/complaintScreening");

// ======================================
// BASE ANSWERS
// ======================================

const baseAnswers = {
    complainantMunicipality: "Test Municipality",
    complainantBarangay: "Test Barangay",
    respondentMunicipality: "Test Municipality",
    respondentBarangay: "Test Barangay",

    governmentParty: "no",
    publicOfficial: "no",

    criminalOffense: "no",
    penaltyThreshold: "not_applicable",
    privateOffendedParty: "not_applicable",

    realPropertyDispute: "no",
    propertyDifferentCities: "not_applicable",
    propertyPartiesAgree: "not_applicable",

    barangaysAdjoining: "not_applicable",
    partiesAgree: "not_applicable",

    otherException: "no"
};

// ======================================
// TEST CASES
// ======================================

const tests = [
    // NORMAL INPUT
    {
        name: "Control — valid baseline",
        answers: { ...baseAnswers },
        expectedCategory: "eligible"
    },

    // MISSING DATA
    {
        name: "Missing — governmentParty",
        answers: { ...baseAnswers, governmentParty: undefined },
        expectedCategory: "review"
    },
    {
        name: "Missing — both municipalities",
        answers: {
            ...baseAnswers,
            complainantMunicipality: undefined,
            respondentMunicipality: undefined
        },
        expectedCategory: "review"
    },
    {
        name: "Missing — complainant municipality",
        answers: { ...baseAnswers, complainantMunicipality: undefined },
        expectedCategory: "review"
    },
    {
        name: "Missing — both barangays",
        answers: {
            ...baseAnswers,
            complainantBarangay: undefined,
            respondentBarangay: undefined
        },
        expectedCategory: "review"
    },
    {
        name: "Missing — criminalOffense",
        answers: { ...baseAnswers, criminalOffense: undefined },
        expectedCategory: "review"
    },

    // INVALID ANSWERS
    {
        name: "Invalid — governmentParty",
        answers: { ...baseAnswers, governmentParty: "maybe" },
        expectedCategory: "review"
    },
    {
        name: "Invalid — publicOfficial",
        answers: { ...baseAnswers, publicOfficial: "abc" },
        expectedCategory: "review"
    },
    {
        name: "Invalid — criminalOffense",
        answers: { ...baseAnswers, criminalOffense: "unknown-value" },
        expectedCategory: "review"
    },

    // NORMALIZATION — CASE
    {
        name: "Normalization — uppercase YES",
        answers: { ...baseAnswers, governmentParty: "YES" },
        expectedCategory: "excluded"
    },
    {
        name: "Normalization — uppercase NO",
        answers: { ...baseAnswers, governmentParty: "NO" },
        expectedCategory: "eligible"
    },

    // NORMALIZATION — WHITESPACE
    {
        name: "Normalization — padded YES",
        answers: { ...baseAnswers, governmentParty: " yes " },
        expectedCategory: "excluded"
    },
    {
        name: "Normalization — padded NO",
        answers: { ...baseAnswers, governmentParty: " no " },
        expectedCategory: "eligible"
    },

    // EMPTY / INCOMPLETE INPUT
    {
        name: "Empty — answers object",
        answers: {},
        expectedCategory: "review"
    },
    {
        name: "Empty — all answer fields",
        answers: {
            complainantMunicipality: "",
            complainantBarangay: "",
            respondentMunicipality: "",
            respondentBarangay: "",

            governmentParty: "",
            publicOfficial: "",

            criminalOffense: "",
            penaltyThreshold: "",
            privateOffendedParty: "",

            realPropertyDispute: "",
            propertyDifferentCities: "",
            propertyPartiesAgree: "",

            barangaysAdjoining: "",
            partiesAgree: "",

            otherException: ""
        },
        expectedCategory: "review"
    },

    // WRONG INPUT TYPES
    {
        name: "Type — answers is a string",
        answers: "invalid-input",
        expectedCategory: "review"
    },
    {
        name: "Type — answers is a number",
        answers: 12345,
        expectedCategory: "review"
    },
    {
        name: "Type — answers is an array",
        answers: [],
        expectedCategory: "review"
    },
    {
        name: "Type — answers is null",
        answers: null,
        expectedCategory: "review"
    },
    {
        name: "Type — answers is undefined",
        answers: undefined,
        expectedCategory: "review"
    }
];

// ======================================
// EXPECTED STATUS MAPPING
// ======================================

const categoryToStatus = {
    eligible: "Potentially Eligible for KP Review",
    review: "Requires Barangay Staff Review",
    excluded: "Potentially Outside KP Jurisdiction"
};

// ======================================
// HELPERS
// ======================================

function hasValidResultShape(result) {
    return (
        result !== null &&
        typeof result === "object" &&
        typeof result.status === "string" &&
        typeof result.category === "string" &&
        Array.isArray(result.reasons) &&
        Array.isArray(result.warnings)
    );
}

// ======================================
// RUN TESTS
// ======================================

console.log("\n===== SCREENING ROBUSTNESS TEST =====\n");

let passed = 0;
let failed = 0;

for (const test of tests) {
    let result;
    let error = null;

    try {
        result = screenComplaint(test.answers);
    } catch (err) {
        error = err;
    }

    const expectedStatus = categoryToStatus[test.expectedCategory];

    const shapeCorrect = !error && hasValidResultShape(result);
    const categoryCorrect =
        shapeCorrect && result.category === test.expectedCategory;
    const statusCorrect =
        shapeCorrect && result.status === expectedStatus;

    const success =
        shapeCorrect &&
        categoryCorrect &&
        statusCorrect;

    if (success) {
        passed++;
        console.log(`PASS: ${test.name}`);
    } else {
        failed++;
        console.log(`FAIL: ${test.name}`);

        if (error) {
            console.log(`  Error: ${error.message}`);
        } else if (!shapeCorrect) {
            console.log("  Invalid output structure:", result);
        } else {
            if (!categoryCorrect) {
                console.log(
                    `  Expected category: ${test.expectedCategory}`
                );
                console.log(
                    `  Actual category:   ${result.category}`
                );
            }

            if (!statusCorrect) {
                console.log(
                    `  Expected status: ${expectedStatus}`
                );
                console.log(
                    `  Actual status:   ${result.status}`
                );
            }

            console.log("  Warnings:", result.warnings);
            console.log("  Reasons:", result.reasons);
        }
    }
}

// ======================================
// SUMMARY
// ======================================

console.log("\n===== ROBUSTNESS TEST SUMMARY =====");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${tests.length}`);
console.log("===============================\n");

if (failed > 0) {
    process.exitCode = 1;
}