
const STORAGE_KEY = "luponResolveCases";

let cases = [];
let selectedCaseId = null;

const caseList = document.getElementById("luponCaseList");
const caseDetails = document.getElementById("luponCaseDetails");
const searchInput = document.getElementById("luponSearch");

function getCaseId(caseItem) {
    return String(
        caseItem.id ??
        caseItem.caseId ??
        caseItem.complaintId ??
        ""
    );
}
// Check whether a case has reached a completed workflow stage.
function isCaseCompleted(caseItem) {
    return [
        "Resolved",
        "Certificate to File Action",
        "Closed"
    ].includes(caseItem.caseStage);
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
        const response = await fetch("http://127.0.0.1:3000/api/cases", {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load assigned cases.");
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
            screeningStatus: item.screeningStatus,
            caseStage: item.caseStage || "Secretary Review",
            arbitrationApplicable: item.arbitrationApplicable,
            caseProceedings: item.caseProceedings || [],
            caseHistory: item.caseHistory || [],
            createdAt: item.createdAt
        }));

        console.log("Lupon assigned cases loaded from backend:", cases);

        renderEverything();

    } catch (error) {
        console.error("Unable to load Lupon cases:", error);

        cases = [];
        renderEverything();

        caseList.innerHTML = `
            <p class="empty-state">
                Unable to load assigned cases. Please check your login
                and make sure the backend server is running.
            </p>
        `;
    }
}

function saveCases() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
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
            showEmptySelection();
        }
    }
}

function renderStatistics() {
    const resolvedCount = cases.filter(item =>
        ["Resolved", "Certificate to File Action", "Closed"]
            .includes(item.caseStage)
    ).length;

    document.getElementById("luponTotal").textContent = cases.length;

    document.getElementById("luponResolved").textContent =
        resolvedCount;

    document.getElementById("luponActive").textContent =
        cases.length - resolvedCount;
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
                No complaints found.
                Submit a demo complaint through the Resident Portal first.
            </p>
        `;
        return;
    }

    caseList.innerHTML = filteredCases.map(caseItem => {
        const id = getCaseId(caseItem);
        const selected = id === selectedCaseId ? "selected" : "";
        const completed = isCaseCompleted(caseItem);

        const stageLabel = completed
        ? `No Further Proceedings — ${caseItem.caseStage}`
        : `Active — ${caseItem.caseStage || "Secretary Review"}`;
        return `
            <button
                type="button"
                class="lupon-case-item ${selected}"
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

                <span class="stage-pill ${completed ? "completed" : "active"}">
                    ${escapeHTML(stageLabel)}
                </span>
            </button>
        `;
    }).join("");
}

function showEmptySelection() {
    caseDetails.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">⚖</div>
            <h3>No case selected</h3>
            <p>Select a complaint from the case list.</p>
        </div>
    `;
}
    
function renderCaseDetails(caseItem) {
    const id = getCaseId(caseItem);
    const completed = isCaseCompleted(caseItem);

    const proceedings = Array.isArray(caseItem.caseProceedings)
        ? [...caseItem.caseProceedings].reverse()
        : [];

    const proceedingsHTML = proceedings.length > 0
        ? proceedings.map(entry => {
            const proceedingType =
                entry.proceedingType || entry.type || "Proceeding";

            const attendees = Array.isArray(entry.attendees)
                ? entry.attendees.join(", ")
                : entry.attendees || "Not recorded";

            return `
                <article class="proceeding-entry">
                    <h4>${escapeHTML(proceedingType)} — ${escapeHTML(entry.outcome)}</h4>

                    <p><strong>Meeting date:</strong> ${escapeHTML(entry.meetingDate)}</p>
                    <p><strong>Attendees:</strong> ${escapeHTML(attendees)}</p>
                    <p><strong>Summary:</strong> ${escapeHTML(entry.summary)}</p>

                    ${entry.nextAction ? `
                        <p><strong>Next action:</strong> ${escapeHTML(entry.nextAction)}</p>
                    ` : ""}

                    <time>Recorded: ${escapeHTML(entry.recordedAt)}</time>
                </article>
            `;
        }).join("")
        : `<p class="empty-state">No proceedings have been recorded for this case.</p>`;

    caseDetails.innerHTML = `
        <div class="detail-heading">
            <h2>${escapeHTML(caseItem.complainantName || "Complaint Details")}</h2>
            <p>Case ID: ${escapeHTML(id || "Not assigned")}</p>
        </div>

        <section class="detail-section">
    <h3>Record a Proceeding</h3>

    ${
        completed
            ? `
                <div class="empty-state">
                    <h4>No Further Proceedings</h4>
                    <p>
                        This case has reached
                        <strong>${escapeHTML(caseItem.caseStage)}</strong>.
                        Additional proceedings can no longer be recorded.
                    </p>
                </div>
            `
            : `
                <form id="proceedingForm" class="proceeding-form">

                    <label for="proceedingType">Proceeding Type</label>
                    <select id="proceedingType" required>
                        <option value="Mediation">Mediation</option>
                        <option value="Conciliation">Conciliation</option>
                        <option value="Arbitration">Arbitration</option>
                    </select>

                    <label for="meetingDate">Meeting Date</label>
                    <input type="date" id="meetingDate" required>

                    <label for="attendees">Attendees</label>
                    <textarea
                        id="attendees"
                        placeholder="Enter the names of attendees..."
                        required
                    ></textarea>

                    <label for="proceedingOutcome">Proceeding Outcome</label>
                    <select id="proceedingOutcome" required>
                        <option value="">Select an outcome</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Agreement Reached">Agreement Reached</option>
                        <option value="No Agreement">No Agreement</option>
                        <option value="Rescheduled">Rescheduled</option>
                        <option value="Referred for Further Action">Referred for Further Action</option>
                    </select>

                    <label for="proceedingSummary">Discussion / Proceeding Summary</label>
                    <textarea
                        id="proceedingSummary"
                        placeholder="Describe what happened during the proceeding..."
                        required
                    ></textarea>

                    <label for="nextAction">Next Action (Optional)</label>
                    <textarea
                        id="nextAction"
                        placeholder="Enter the planned next step..."
                    ></textarea>

                    <button type="submit" class="proceeding-button">
                        Save Proceeding Record
                    </button>
                </form>
            `
    }
</section>

        <section class="detail-section">
            <h3>Incident Details</h3>
            <div class="incident-box">
                ${escapeHTML(caseItem.incidentDetails || "No incident details provided.")}
            </div>
        </section>

        <section class="detail-section">
            <h3>Proceeding History</h3>
            <div class="proceeding-history">
                ${proceedingsHTML}
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
    if (event.target.id !== "proceedingForm") return;

    event.preventDefault();

    const selectedCase = cases.find(
        item => getCaseId(item) === selectedCaseId
    );

    if (!selectedCase) {
        alert("Please select a case first.");
        return;
    }

    const type = document.getElementById("proceedingType").value;
    const meetingDate = document.getElementById("meetingDate").value;
    const attendees = document.getElementById("attendees").value.trim();
    const outcome = document.getElementById("proceedingOutcome").value;
    const summary = document.getElementById("proceedingSummary").value.trim();
    const nextAction = document.getElementById("nextAction").value.trim();

    if (!meetingDate || !attendees || !outcome || !summary) {
        alert("Please complete all required proceeding fields.");
        return;
    }

    if (
        type === "Arbitration" &&
        selectedCase.arbitrationApplicable !== true
    ) {
        alert(
            "Arbitration has not been marked as applicable for this case."
        );
        return;
    }

    if (!selectedCase.backendId) {
        alert("Unable to identify the database case ID.");
        return;
    }

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');

    try {
        submitButton.disabled = true;
        submitButton.textContent = "Saving Proceeding...";

        const response = await fetch(
            `http://127.0.0.1:3000/api/cases/${selectedCase.backendId}/proceedings`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    proceedingType: type,
                    meetingDate,
                    attendees: attendees
                    .split(/\r?\n|,/)
                    .map(name => name.trim())
                    .filter(name => name !== ""),
                    outcome,
                    summary,
                    nextAction
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to save proceeding."
            );
        }

        alert("Proceeding record saved successfully!");

        await loadCases();

    } catch (error) {
        console.error("Proceeding submission error:", error);
        alert(error.message);

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Save Proceeding Record";
    }
});


function startLuponPortal() {
    loadCases();
}

startLuponPortal();
