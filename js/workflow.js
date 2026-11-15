

let cases = [];
let selectedCaseId = null;

const workflowStages = [
    "Secretary Review",
    "For Lupon Assessment",
    "Mediation",
    "Conciliation",
    "Arbitration",
    "Resolved",
    "Certificate to File Action",
    "Closed"
];

const allowedTransitions = {
    "Secretary Review": [
        "For Lupon Assessment"
    ],

    "For Lupon Assessment": [
        "Mediation",
        "Conciliation",
        "Arbitration"
    ],

    "Mediation": [
        "Conciliation",
        "Certificate to File Action"
    ],

    "Conciliation": [
        "Arbitration",
        "Certificate to File Action"
    ],

    "Arbitration": [
        "Certificate to File Action"
    ],

    "Resolved": [],

    "Certificate to File Action": [],

    "Closed": []
};


const caseList = document.getElementById("workflowCaseList");
const caseDetails = document.getElementById("workflowDetails");
const searchInput = document.getElementById("workflowSearch");

function getCaseId(caseItem) {
    return String(
        caseItem.id ??
        caseItem.caseId ??
        caseItem.complaintId ??
        ""
    );
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
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

        cases = data.cases.map(item => ({
            id: item.caseNumber,
            backendId: item.id,
            caseId: item.caseNumber,

            complainantName: item.complainantName,
            respondentName: item.respondentName,
            disputeType: item.disputeType,
            incidentDetails: item.incidentDetails,

            status: item.status,
            caseStage: item.caseStage || "Secretary Review",
            arbitrationApplicable: item.arbitrationApplicable,

            caseHistory: item.caseHistory || [],
            caseProceedings: item.caseProceedings || [],

            // Resolution information
            resolutionOutcome: item.resolutionOutcome || "",
            resolutionNotes: item.resolutionNotes || "",
            resolvedAt: item.resolvedAt || null,
            resolvedBy: item.resolvedBy || null,

            // Closure information
            closureNotes: item.closureNotes || "",
            closedAt: item.closedAt || null,
            closedBy: item.closedBy || null,

            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        }));

        console.log(
            "Workflow cases loaded from backend:",
            cases
        );

        renderEverything();

    } catch (error) {
        console.error("Unable to load workflow cases:", error);

        cases = [];
        renderEverything();

        caseList.innerHTML = `
            <p class="empty-state">
                Unable to load cases. Please check your login
                and make sure the backend server is running.
            </p>
        `;
    }
}

function renderEverything() {
    renderStatistics();
    renderCaseList();

    if (selectedCaseId !== null) {
        const selectedCase = cases.find(
            item => getCaseId(item) === selectedCaseId
        );

        if (selectedCase) {
            renderCaseDetails(selectedCase);
        } else {
            selectedCaseId = null;
            showNoSelection();
        }
    }
}

function renderStatistics() {
    document.getElementById("workflowTotal").textContent = cases.length;

    const resolved = cases.filter(item =>
        item.caseStage === "Resolved" ||
        item.caseStage === "Certificate to File Action" ||
        item.caseStage === "Closed"
    ).length;

    document.getElementById("workflowResolved").textContent = resolved;
    document.getElementById("workflowProgress").textContent =
        cases.length - resolved;
}

function renderCaseList() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredCases = cases.filter(caseItem => {
        const id = getCaseId(caseItem).toLowerCase();
        const complainant = String(
            caseItem.complainantName || ""
        ).toLowerCase();

        const respondent = String(
            caseItem.respondentName || ""
        ).toLowerCase();

        return (
            id.includes(searchTerm) ||
            complainant.includes(searchTerm) ||
            respondent.includes(searchTerm)
        );
    });

    if (filteredCases.length === 0) {
        caseList.innerHTML = `
            <p class="empty-state">
                No matching complaints found.
            </p>
        `;
        return;
    }

    caseList.innerHTML = filteredCases.map(caseItem => {
        const id = getCaseId(caseItem);
        const selected = id === selectedCaseId ? "selected" : "";

        return `
            <button
                type="button"
                class="workflow-case-item ${selected}"
                data-case-id="${escapeHTML(id)}"
            >
                <strong>
                    ${escapeHTML(caseItem.complainantName || "Unnamed complainant")}
                </strong>

                <span>Case ID: ${escapeHTML(id || "Not assigned")}</span>

                <span>
                    Respondent:
                    ${escapeHTML(caseItem.respondentName || "Not provided")}
                </span>

                <span class="stage-pill">
                    ${escapeHTML(caseItem.caseStage || "Secretary Review")}
                </span>
            </button>
        `;
    }).join("");
}

function showNoSelection() {
    caseDetails.innerHTML = `
        <div class="empty-state detail-empty">
            <div class="empty-icon">↗</div>
            <h3>No case selected</h3>
            <p>Select a case from the list to view its workflow.</p>
        </div>
    `;
}

function renderCaseDetails(caseItem) {
    const id = getCaseId(caseItem);
    const history = Array.isArray(caseItem.caseHistory)
        ? [...caseItem.caseHistory].reverse()
        : [];
    const proceedings = Array.isArray(caseItem.caseProceedings)
    ? [...caseItem.caseProceedings].reverse()
    : [];

    const currentStage = caseItem.caseStage || "Secretary Review";

    const availableStages = [
        currentStage,
        ...(allowedTransitions[currentStage] || [])
    ];

    const stageOptions = availableStages.map(stage => {
        const selected = currentStage === stage ? "selected" : "";

        return `
            <option value="${escapeHTML(stage)}" ${selected}>
                ${escapeHTML(stage)}
            </option>
        `;
    }).join("");

    
const historyHTML = history.length > 0
    ? history.map(entry => `
        <div class="history-item">
            <strong>
                ${escapeHTML(
                    entry.stage ||
                    entry.action ||
                    entry.proceedingType ||
                    "Workflow update"
                )}
            </strong>

            <p>
                ${escapeHTML(
                    entry.note ||
                    entry.notes ||
                    entry.summary ||
                    "No additional note."
                )}
            </p>

            <time>
                ${escapeHTML(
                    entry.date ||
                    entry.updatedAt ||
                    entry.recordedAt ||
                    ""
                )}
            </time>
        </div>
    `).join("")
    : `<p class="empty-state">No workflow updates recorded yet.</p>`;

    
const proceedingsHTML = proceedings.length > 0
    ? proceedings.map(entry => {
        const attendees = Array.isArray(entry.attendees)
            ? entry.attendees.join(", ")
            : entry.attendees || "Not recorded";

        return `
            <div class="history-item">
                <strong>
                    ${escapeHTML(
                        entry.proceedingType || entry.type || "Proceeding"
                    )}
                </strong>

                <p>
                    <strong>Meeting Date:</strong>
                    ${escapeHTML(entry.meetingDate || "Not recorded")}
                </p>

                <p>
                    <strong>Outcome:</strong>
                    ${escapeHTML(entry.outcome || "Not recorded")}
                </p>

                <p>
                    <strong>Attendees:</strong>
                    ${escapeHTML(attendees)}
                </p>

                <p>
                    <strong>Summary:</strong>
                    ${escapeHTML(entry.summary || "No summary provided.")}
                </p>

                <p>
                    <strong>Next Action:</strong>
                    ${escapeHTML(entry.nextAction || "None recorded")}
                </p>
            </div>
        `;
    }).join("")
    : `<p class="empty-state">No Lupon proceedings recorded yet.</p>`;


    // Find the saved resolution and closure history entries.
    const resolutionHistory = (caseItem.caseHistory || []).find(
        entry => entry.action === "Case resolution recorded"
    );

    const closureHistory = (caseItem.caseHistory || []).find(
        entry => entry.action === "Case closed"
    );

    const resolutionEligible = [
        "Mediation",
        "Conciliation",
        "Arbitration"
    ].includes(currentStage);

    const closureEligible = [
        "Resolved",
        "Certificate to File Action"
    ].includes(currentStage);

    // Resolution section.
    let resolutionHTML = "";

    if (caseItem.resolutionOutcome) {
        resolutionHTML = `
            <div class="history-item">
                <strong>${escapeHTML(caseItem.resolutionOutcome)}</strong>
                <p>${escapeHTML(caseItem.resolutionNotes || "No notes recorded.")}</p>
                <p>
                    <strong>Recorded by:</strong>
                    ${escapeHTML(resolutionHistory?.recordedBy || "Secretary")}
                </p>
                <time>${escapeHTML(caseItem.resolvedAt || resolutionHistory?.recordedAt || "")}</time>
            </div>
        `;
    } else if (resolutionEligible) {
        resolutionHTML = `
            <form id="resolutionForm" class="workflow-form">
                <label for="resolutionOutcome">Resolution Outcome</label>

                <select id="resolutionOutcome" required>
                    <option value="">Select an outcome</option>
                    <option value="Agreement Reached">Agreement Reached</option>
                    <option value="Amicable Settlement">Amicable Settlement</option>
                    <option value="Other">Other</option>
                </select>

                <label for="resolutionNotes">Resolution Notes</label>

                <textarea
                    id="resolutionNotes"
                    placeholder="Describe the agreement or final resolution..."
                    required
                ></textarea>

                <button type="submit" class="save-stage-button">
                    Save Case Resolution
                </button>
            </form>
        `;
    } else {
        resolutionHTML = `
            <p class="empty-state">
                Resolution recording becomes available during Mediation,
                Conciliation, or Arbitration.
            </p>
        `;
    }

    // Closure section.
    let closureHTML = "";

    if (caseItem.closedAt) {
        closureHTML = `
            <div class="history-item">
                <strong>Case Closed</strong>
                <p>${escapeHTML(caseItem.closureNotes || "No closure notes recorded.")}</p>
                <p>
                    <strong>Closed by:</strong>
                    ${escapeHTML(closureHistory?.closedBy || "Secretary")}
                </p>
                <time>${escapeHTML(caseItem.closedAt || closureHistory?.closedAt || "")}</time>
            </div>
        `;
    } else if (closureEligible) {
        closureHTML = `
            <form id="closureForm" class="workflow-form">
                <label for="closureNotes">Closure Notes</label>

                <textarea
                    id="closureNotes"
                    placeholder="Explain why this case is being administratively closed..."
                    required
                ></textarea>

                <button type="submit" class="save-stage-button">
                    Close Case
                </button>
            </form>
        `;
    } else {
        closureHTML = `
            <p class="empty-state">
                Closure becomes available after resolution or when the
                case reaches Certificate to File Action.
            </p>
        `;
    }

    caseDetails.innerHTML = `
        <div class="detail-heading">
            <h2>${escapeHTML(caseItem.complainantName || "Complaint Details")}</h2>
            <p>Case ID: ${escapeHTML(id || "Not assigned")}</p>
        </div>

        <section class="detail-section">
            <h3>Case Information</h3>

            <div class="case-information">
                <div class="info-box">
                    <span>Complainant</span>
                    <strong>${escapeHTML(caseItem.complainantName || "Not provided")}</strong>
                </div>

                <div class="info-box">
                    <span>Respondent</span>
                    <strong>${escapeHTML(caseItem.respondentName || "Not provided")}</strong>
                </div>

                <div class="info-box">
                    <span>Dispute Type</span>
                    <strong>${escapeHTML(caseItem.disputeType || "Not provided")}</strong>
                </div>

                <div class="info-box">
                    <span>Administrative Status</span>
                    <strong>${escapeHTML(caseItem.status || "Pending Review")}</strong>
                </div>

                <div class="info-box">
                    <span>Current Workflow Stage</span>
                    <strong>${escapeHTML(caseItem.caseStage || "Secretary Review")}</strong>
                </div>
            </div>
        </section>

        <section class="detail-section">
            <h3>Update Case Workflow</h3>

            <form id="workflowForm" class="workflow-form">
                <label for="nextStage">New Case Stage</label>

                <select id="nextStage" required>
                    ${stageOptions}
                </select>

                <label class="arbitration-check">
                    <input
                        type="checkbox"
                        id="arbitrationApplicable"
                        ${caseItem.arbitrationApplicable ? "checked" : ""}
                    >
                    <span>
                        Arbitration is applicable to this case, as determined
                        by authorized personnel.
                    </span>
                </label>

                <label for="stageNote">Update Notes</label>

                <textarea
                    id="stageNote"
                    placeholder="Describe what happened, the action taken, or the reason for this update..."
                    required
                ></textarea>

                <button type="submit" class="save-stage-button">
                    Save Workflow Update
                </button>
            </form>
        </section>

        <section class="detail-section">
            <h3>Workflow History</h3>
            <div class="history-list">
                ${historyHTML}
            </div>
        </section>
        <section class="detail-section">
    <h3>Lupon Proceedings</h3>

    <div class="history-list">
        ${proceedingsHTML}
    </div>
</section>

        <section class="detail-section">
            <h3>Case Resolution</h3>
            <div class="history-list">
                ${resolutionHTML}
            </div>
        </section>

        <section class="detail-section">
            <h3>Case Closure</h3>
            <div class="history-list">
                ${closureHTML}
            </div>
        </section>

    `;
}

caseList.addEventListener("click", event => {
    const button = event.target.closest("[data-case-id]");

    if (!button) return;

    selectedCaseId = button.dataset.caseId;

    renderCaseList();

    const selectedCase = cases.find(
        item => getCaseId(item) === selectedCaseId
    );

    if (selectedCase) {
        renderCaseDetails(selectedCase);
    }
});

searchInput.addEventListener("input", renderCaseList);


caseDetails.addEventListener("submit", async event => {
    if (event.target.id !== "workflowForm") return;

    event.preventDefault();

    const selectedCase = cases.find(
        item => getCaseId(item) === selectedCaseId
    );

    if (!selectedCase) {
        alert("Please select a case first.");
        return;
    }

    const nextStage = document.getElementById("nextStage").value;
    const note = document.getElementById("stageNote").value.trim();

    const arbitrationApplicable =
        document.getElementById("arbitrationApplicable").checked;

    if (!note) {
        alert("Please provide notes for this workflow update.");
        return;
    }

    if (
        nextStage === "Arbitration" &&
        !arbitrationApplicable
    ) {
        alert(
            "Please confirm that arbitration is applicable before selecting this stage."
        );
        return;
    }

    const previousStage = selectedCase.caseStage || "Secretary Review";

    if (previousStage === nextStage) {
        const continueSameStage = confirm(
            "The selected stage is already the current stage. Save this as an additional history entry?"
        );

        if (!continueSameStage) return;
    }

    const saveButton = event.target.querySelector(
        ".save-stage-button"
    );

    try {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        const response = await fetch(
            `${window.API.cases}/${selectedCase.backendId}/workflow`,
            {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    caseStage: nextStage,
                    arbitrationApplicable: arbitrationApplicable,
                    note: note
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to save workflow update."
            );
        }

        alert("Workflow update saved successfully!");

        await loadCases();

    } catch (error) {
        console.error("Workflow update failed:", error);

        alert(
            error.message || "Something went wrong while saving."
        );

    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Save Workflow Update";
    }
});


// Handle Resolution and Closure form submissions.
caseDetails.addEventListener("submit", async event => {
    const formId = event.target.id;

    if (
        formId !== "resolutionForm" &&
        formId !== "closureForm"
    ) {
        return;
    }

    event.preventDefault();

    const selectedCase = cases.find(
        item => getCaseId(item) === selectedCaseId
    );

    if (!selectedCase) {
        alert("Please select a case first.");
        return;
    }

    const isResolution = formId === "resolutionForm";

    const endpoint = isResolution
        ? "resolution"
        : "closure";

    const button = event.target.querySelector("button[type='submit']");

    let requestBody;

    if (isResolution) {
        const resolutionOutcome =
            document.getElementById("resolutionOutcome").value;

        const resolutionNotes =
            document.getElementById("resolutionNotes").value.trim();

        if (!resolutionOutcome || !resolutionNotes) {
            alert("Please provide the resolution outcome and notes.");
            return;
        }

        requestBody = {
            resolutionOutcome,
            resolutionNotes
        };

    } else {
        const closureNotes =
            document.getElementById("closureNotes").value.trim();

        if (!closureNotes) {
            alert("Please provide closure notes.");
            return;
        }

        requestBody = {
            closureNotes
        };
    }

    try {
        button.disabled = true;
        button.textContent = "Saving...";

        const response = await fetch(
            `${window.API.cases}/${selectedCase.backendId}/${endpoint}`,
            {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to save case information."
            );
        }

        alert(data.message);

        await loadCases();

    } catch (error) {
        console.error(`${endpoint} submission failed:`, error);

        alert(error.message || "Something went wrong.");

    } finally {
        button.disabled = false;
        button.textContent = isResolution
            ? "Save Case Resolution"
            : "Close Case";
    }
});

function startWorkflow() {
    searchInput.value = "";
    loadCases();
}

startWorkflow();
