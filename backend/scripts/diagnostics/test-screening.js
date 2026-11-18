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
    // BASELINE
    {
        name: "Baseline eligible complaint",
        changes: {},
        expected: "Potentially Eligible for KP Review",
        expectedCategory: "eligible"
    },

    // RULE 1 — GOVERNMENT PARTY
    {
        name: "Government party — excluded",
        changes: { governmentParty: "yes" },
        expected: "Potentially Outside KP Jurisdiction",
        expectedCategory: "excluded",
        expectedReasons: ["government or one of its subdivisions"]
    },
    {
        name: "Government party — unsure",
        changes: { governmentParty: "unsure" },
        expected: "Requires Barangay Staff Review",
        expectedCategory: "review",
        expectedWarnings: ["Government involvement needs verification"]
    },

    // RULE 2 — PUBLIC OFFICIAL
    {
        name: "Public official — excluded",
        changes: { publicOfficial: "yes" },
        expected: "Potentially Outside KP Jurisdiction",
        expectedCategory: "excluded",
        expectedReasons: ["public officer or employee"]
    },
    {
        name: "Public official — unsure",
        changes: { publicOfficial: "unsure" },
        expected: "Requires Barangay Staff Review",
        expectedCategory: "review",
        expectedWarnings: ["nature of any public officer's involvement"]
    },

    // RULES 3 & 4 — CRIMINAL OFFENSE
    {
        name: "Criminal offense — penalty exceeds threshold",
        changes: {
            criminalOffense: "yes",
            penaltyThreshold: "yes",
            privateOffendedParty: "yes"
        },
        expected: "Potentially Outside KP Jurisdiction",
        expectedCategory: "excluded",
        expectedReasons: ["possible penalty exceeds"]
    },
    {
        name: "Criminal offense — penalty threshold unsure",
        changes: {
            criminalOffense: "yes",
            penaltyThreshold: "unsure",
            privateOffendedParty: "yes"
        },
        expected: "Requires Barangay Staff Review",
        expectedCategory: "review",
        expectedWarnings: ["applicable penalty needs legal verification"]
    },
    {
        name: "Criminal offense — penalty below threshold",
        changes: {
            criminalOffense: "yes",
            penaltyThreshold: "no",
            privateOffendedParty: "yes"
        },
        expected: "Potentially Eligible for KP Review",
        expectedCategory: "eligible"
    },
    {
        name: "Criminal offense — no private offended party",
        changes: {
            criminalOffense: "yes",
            penaltyThreshold: "no",
            privateOffendedParty: "no"
        },
        expected: "Potentially Outside KP Jurisdiction",
        expectedCategory: "excluded",
        expectedReasons: ["no private offended party"]
    },
    {
        name: "Criminal offense — private offended party unsure",
        changes: {
            criminalOffense: "yes",
            penaltyThreshold: "no",
            privateOffendedParty: "unsure"
        },
        expected: "Requires Barangay Staff Review",
        expectedCategory: "review",
        expectedWarnings: ["private offended party"]
    },
    {
        name: "Criminal offense — offense status unsure",
        changes: {
            criminalOffense: "unsure",
            penaltyThreshold: "not_applicable",
            privateOffendedParty: "not_applicable"
        },
        expected: "Requires Barangay Staff Review",
        expectedCategory: "review",
        expectedWarnings: ["unclear whether the complaint involves a criminal offense"]
    },
    {
        name: "No criminal offense — inconsistent answers",
        changes: {
            criminalOffense: "no",
            penaltyThreshold: "yes",
            privateOffendedParty: "yes"
        },
        expected: "Requires Barangay Staff Review",
        expectedCategory: "review",
        expectedWarnings: ["inconsistent with the stated absence of a criminal offense"]
    },

    // RULE 5 — REAL PROPERTY
    {
        name: "Real property, same municipality, agreement N/A",
        changes: {
            realPropertyDispute: "yes",
            propertyDifferentCities: "no",
            propertyPartiesAgree: "not_applicable"
        },
        expected: "Potentially Eligible for KP Review",
        expectedCategory: "eligible"
    },
    {
        name: "Real property, same municipality, agreement YES (inconsistent)",
        changes: {
            realPropertyDispute: "yes",
            propertyDifferentCities: "no",
            propertyPartiesAgree: "yes"
        },
        expected: "Requires Barangay Staff Review",
        expectedCategory: "review",
        expectedWarnings: ["agreement question should be marked not applicable"]
    },
    {
        name: "Real property, same municipality, agreement NO (inconsistent)",
        changes: {
            realPropertyDispute: "yes",
            propertyDifferentCities: "no",
            propertyPartiesAgree: "no"
        },
        expected: "Requires Barangay Staff Review",
        expectedCategory: "review",
        expectedWarnings: ["agreement question should be marked not applicable"]
    },
    {
        name: "Real property, different municipalities, no agreement",
        changes: {
            realPropertyDispute: "yes",
            propertyDifferentCities: "yes",
            propertyPartiesAgree: "no"
        },
        expected: "Potentially Outside KP Jurisdiction",
        expectedCategory: "excluded",
        expectedReasons: ["real properties are in different cities or municipalities"]
    },
    {
        name: "Real property, different municipalities, agreement YES",
        changes: {
            realPropertyDispute: "yes",
            propertyDifferentCities: "yes",
            propertyPartiesAgree: "yes"
        },
        expected: "Potentially Eligible for KP Review",
        expectedCategory: "eligible"
    },
    {
        name: "Real property, different municipalities, unsure agreement",
        changes: {
            realPropertyDispute: "yes",
            propertyDifferentCities: "yes",
            propertyPartiesAgree: "unsure"
        },
        expected: "Requires Barangay Staff Review",
        expectedCategory: "review",
        expectedWarnings: ["agreement of the parties concerning real property"]
    },
    {
        name: "Real property, municipality location unsure",
        changes: {
            realPropertyDispute: "yes",
            propertyDifferentCities: "unsure",
            propertyPartiesAgree: "not_applicable"
        },
        expected: "Requires Barangay Staff Review",
        expectedCategory: "review",
        expectedWarnings: ["locations of the real properties need verification"]
    },
    {
        name: "Real property status unsure",
        changes: { realPropertyDispute: "unsure" },
        expected: "Requires Barangay Staff Review",
        expectedCategory: "review",
        expectedWarnings: ["established whether the dispute involves real property"]
    },

    // RULE 6 — DIFFERENT MUNICIPALITIES
    {
        name: "Different municipalities — non-adjoining barangays",
        changes: {
            complainantMunicipality: "Municipality A",
            respondentMunicipality: "Municipality B",
            barangaysAdjoining: "no",
            partiesAgree: "no"
        },
        expected: "Potentially Outside KP Jurisdiction",
        expectedCategory: "excluded",
        expectedReasons: ["barangays are indicated as non-adjoining"]
    },
    {
        name: "Different municipalities — adjoining, no agreement",
        changes: {
            complainantMunicipality: "Municipality A",
            respondentMunicipality: "Municipality B",
            barangaysAdjoining: "yes",
            partiesAgree: "no"
        },
        expected: "Potentially Outside KP Jurisdiction",
        expectedCategory: "excluded",
        expectedReasons: ["do not both agree to submit the dispute"]
    },
    {
        name: "Different municipalities — adjoining, agreement YES",
        changes: {
            complainantMunicipality: "Municipality A",
            respondentMunicipality: "Municipality B",
            barangaysAdjoining: "yes",
            partiesAgree: "yes"
        },
        expected: "Potentially Eligible for KP Review",
        expectedCategory: "eligible"
    },
    {
        name: "Different municipalities — adjoining, agreement unsure",
        changes: {
            complainantMunicipality: "Municipality A",
            respondentMunicipality: "Municipality B",
            barangaysAdjoining: "yes",
            partiesAgree: "unsure"
        },
        expected: "Requires Barangay Staff Review",
        expectedCategory: "review",
        expectedWarnings: ["Agreement of both parties needs verification"]
    },
    {
        name: "Different municipalities — adjoining status unsure",
        changes: {
            complainantMunicipality: "Municipality A",
            respondentMunicipality: "Municipality B",
            barangaysAdjoining: "unsure",
            partiesAgree: "not_applicable"
        },
        expected: "Requires Barangay Staff Review",
        expectedCategory: "review",
        expectedWarnings: ["barangays in the different cities or municipalities adjoin each other"]
    },
    {
        name: "Same municipality — different barangays",
        changes: {
            complainantMunicipality: "Test Municipality",
            respondentMunicipality: "Test Municipality",
            complainantBarangay: "Barangay A",
            respondentBarangay: "Barangay B"
        },
        expected: "Potentially Eligible for KP Review",
        expectedCategory: "eligible",
        expectedWarnings: ["Venue should be checked under Section 409"]
    },

    // RULE 7 — OTHER POSSIBLE EXCEPTIONS
    {
        name: "Other exception — yes",
        changes: { otherException: "yes" },
        expected: "Requires Barangay Staff Review",
        expectedCategory: "review",
        expectedWarnings: ["another possible legal exclusion"]
    },
    {
        name: "Other exception — unsure",
        changes: { otherException: "unsure" },
        expected: "Requires Barangay Staff Review",
        expectedCategory: "review",
        expectedWarnings: ["Other possible legal exclusions"]
    }
];

// ======================================
// TEST HELPERS
// ======================================

// Detect duplicate messages.
function hasDuplicates(items) {
    return new Set(items).size !== items.length;
}

// Check if every expected fragment appears in the output array.
function containsExpected(actual, expectedFragments = []) {
    return expectedFragments.every(fragment =>
        actual.some(message => message.toLowerCase().includes(fragment.toLowerCase()))
    );
}
// ======================================
// RUN TESTS
// ======================================

console.log("\n===== SCREENING LOGIC TEST =====\n");

let passed = 0;
let failed = 0;

for (const test of tests) {
    const answers = {
        ...baseAnswers,
        ...test.changes
    };

    const result = screenComplaint(answers);

    const statusCorrect = result.status === test.expected;
    const categoryCorrect = result.category === test.expectedCategory;

    const expectedWarnings = test.expectedWarnings || [];
    const expectedReasons = test.expectedReasons || [];

    const warningsCorrect =
        result.warnings.length === expectedWarnings.length &&
        containsExpected(result.warnings, expectedWarnings);

    const reasonsCorrect =
        result.reasons.length === expectedReasons.length &&
        containsExpected(result.reasons, expectedReasons);

    const noDuplicateWarnings = !hasDuplicates(result.warnings);
    const noDuplicateReasons = !hasDuplicates(result.reasons);

    const success =
        statusCorrect &&
        categoryCorrect &&
        warningsCorrect &&
        reasonsCorrect &&
        noDuplicateWarnings &&
        noDuplicateReasons;

    if (success) {
        passed++;
        console.log(`PASS: ${test.name}`);
    } else {
        failed++;
        console.log(`FAIL: ${test.name}`);

        if (!statusCorrect) {
            console.log(`  Status expected: ${test.expected}`);
            console.log(`  Status actual:   ${result.status}`);
        }

        if (!categoryCorrect) {
            console.log(`  Category expected: ${test.expectedCategory}`);
            console.log(`  Category actual:   ${result.category}`);
        }

        if (!warningsCorrect) {
            console.log("  Warning assertion failed.");
            console.log("  Expected warning fragments:", expectedWarnings);
            console.log("  Actual warnings:", result.warnings);
        }

        if (!reasonsCorrect) {
            console.log("  Reason assertion failed.");
            console.log("  Expected reason fragments:", expectedReasons);
            console.log("  Actual reasons:", result.reasons);
        }

        if (!noDuplicateWarnings) {
            console.log("  Duplicate warnings detected!");
        }

        if (!noDuplicateReasons) {
            console.log("  Duplicate exclusion reasons detected!");
        }
    }

    // Print details only when the result contains messages.
    if (result.warnings.length > 0) {
        console.log("  Warnings:", result.warnings);
    }

    if (result.reasons.length > 0) {
        console.log("  Reasons:", result.reasons);
    }
}

// ======================================
// SUMMARY
// ======================================

console.log("\n===== TEST SUMMARY =====");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${tests.length}`);
console.log("======================\n");

if (failed > 0) {
    process.exitCode = 1;
}