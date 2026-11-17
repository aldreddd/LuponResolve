
// =====================================
// LUPONRESOLVE - SECRETARY DASHBOARD
// =====================================


// 1. GET HTML ELEMENTS

const secretaryNavLinks = document.querySelectorAll(
    ".secretary-nav-link"
);

const secretaryPages = document.querySelectorAll(
    ".secretary-page"
);

const secretaryPageTitle = document.getElementById(
    "secretaryPageTitle"
);

const secretaryBreadcrumb = document.getElementById(
    "secretaryBreadcrumb"
);

const secretaryTotal = document.getElementById(
    "secretaryTotal"
);

const secretaryPending = document.getElementById(
    "secretaryPending"
);

const secretaryUnderReview = document.getElementById(
    "secretaryUnderReview"
);

const secretaryReady = document.getElementById(
    "secretaryReady"
);

const secretaryRecentList = document.getElementById(
    "secretaryRecentList"
);

const complaintTableBody = document.getElementById(
    "complaintTableBody"
);

const complaintSearch = document.getElementById(
    "complaintSearch"
);

const statusFilter = document.getElementById(
    "statusFilter"
);

const complaintCount = document.getElementById(
    "complaintCount"
);

const complaintDetailsContent = document.getElementById(
    "complaintDetailsContent"
);

const backToComplaints = document.getElementById(
    "backToComplaints"
);



// 2. LOAD COMPLAINTS FROM BACKEND

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
                data.message || "Unable to load complaints."
            );
        }

        // Convert backend records into the format
        // already expected by the Secretary Dashboard.

        cases = data.cases.map(item => ({

            backendId: item.id,

            caseId: item.caseNumber,

            complainantName: item.complainantName,

            respondentName: item.respondentName,

            disputeType: item.disputeType,

            incidentDetails: item.incidentDetails,

            status: item.status,

            screeningStatus: item.screeningStatus,

            screeningReasons: item.screeningReasons || [],

            screeningWarnings: item.screeningWarnings || [],

            screeningAnswers: item.screeningAnswers || {},

            secretaryNotes: item.secretaryNotes || "",

            dateSubmitted: item.createdAt
                ? new Date(
                    item.createdAt.replace(" ", "T")
                ).toLocaleDateString()
                : "Unknown"

        }));

        console.log(
            "Secretary complaints loaded from backend:",
            cases
        );

    } catch (error) {

        console.error(
            "Failed to load complaints:",
            error
        );

        cases = [];

        alert(
            "Unable to load complaints from the backend. " +
            error.message
        );

    }

}


// 3. SAVE COMPLAINTS

function saveCases() {

    localStorage.setItem(
        "luponResolveCases",
        JSON.stringify(cases)
    );

}


// 4. HELPER: ESCAPE HTML

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


// 5. NAVIGATION

function showSecretaryPage(pageId) {
    console.log("PAGE NAVIGATION:", pageId);
    console.trace("Navigation triggered by:");

    secretaryPages.forEach(page => {
        page.classList.remove("active");
    });

    secretaryNavLinks.forEach(link => {
        link.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageId);

    if (!selectedPage) {
        return;
    }

    selectedPage.classList.add("active");

    const selectedLink = document.querySelector(
        `.secretary-nav-link[data-page="${pageId}"]`
    );

    if (selectedLink) {
        selectedLink.classList.add("active");
    }

    const titles = {
        overview: "Overview",
        complaints: "Complaints",
        details: "Complaint Details"
    };

    secretaryPageTitle.textContent = titles[pageId];
    secretaryBreadcrumb.textContent = titles[pageId];

    window.location.hash = pageId;

}



secretaryNavLinks.forEach(link => {

    link.addEventListener("click", function(event) {

        // Only handle links that navigate within the Secretary Dashboard.
        if (!this.dataset.page) {
            return;
        }

        event.preventDefault();

        showSecretaryPage(this.dataset.page);

    });

});



document.querySelectorAll("[data-secretary-page]").forEach(button => {

    button.addEventListener("click", function() {

        showSecretaryPage(this.dataset.secretaryPage);

    });

});


backToComplaints.addEventListener("click", function() {

    showSecretaryPage("complaints");

});


// 6. STATUS CLASS

function getStatusClass(status) {

    const classes = {
        "Pending Review": "pending",
        "Under Review": "review",
        "Awaiting Clarification": "clarification",
        "Ready for Lupon Assessment": "ready"
    };

    return classes[status] || "pending";

}


// 7. UPDATE STATISTICS

function renderStatistics() {

    const total = cases.length;

    const pending = cases.filter(
        complaint => complaint.status === "Pending Review"
    ).length;

    const underReview = cases.filter(
        complaint => complaint.status === "Under Review"
    ).length;

    const ready = cases.filter(
        complaint => complaint.status === "Ready for Lupon Assessment"
    ).length;

    secretaryTotal.textContent = total;
    secretaryPending.textContent = pending;
    secretaryUnderReview.textContent = underReview;
    secretaryReady.textContent = ready;

}


// 8. DISPLAY RECENT COMPLAINTS

function renderRecentComplaints() {

    const recentCases = [...cases].reverse().slice(0, 5);

    if (recentCases.length === 0) {

        secretaryRecentList.innerHTML = `
            <div class="secretary-empty">
                <div class="empty-symbol">▤</div>
                <h3>No complaints yet</h3>
                <p>Resident submissions will appear here.</p>
            </div>
        `;

        return;

    }

    secretaryRecentList.innerHTML = recentCases.map(complaint => {

        return `
            <div class="recent-complaint-row">

                <div>
                    <strong>
                        ${escapeHTML(complaint.disputeType)}
                    </strong>

                    <p>
                        ${escapeHTML(complaint.caseId)}
                        ·
                        ${escapeHTML(complaint.complainantName)}
                    </p>
                </div>

                <span class="secretary-status ${getStatusClass(complaint.status)}">
                    ${escapeHTML(complaint.status)}
                </span>

                <button
                    class="secretary-view-button"
                    data-view-case="${escapeHTML(complaint.caseId)}"
                >
                    View
                </button>

            </div>
        `;

    }).join("");

}


// 9. FIND A COMPLAINT

function findCase(caseId) {

    return cases.find(
        complaint => complaint.caseId === caseId
    );

}


// 10. DISPLAY COMPLAINT TABLE

function renderComplaintTable() {

    const searchValue = complaintSearch.value
        .trim()
        .toLowerCase();

    const selectedStatus = statusFilter.value;

    const filteredCases = [...cases].reverse().filter(complaint => {

        const matchesSearch = [

            complaint.caseId,
            complaint.complainantName,
            complaint.respondentName,
            complaint.disputeType

        ].some(value =>

            String(value || "").toLowerCase().includes(searchValue)

        );

        const matchesStatus =
            selectedStatus === "all" ||
            complaint.status === selectedStatus;

        return matchesSearch && matchesStatus;

    });


    complaintCount.textContent =
        `${filteredCases.length} complaint(s) found`;


    if (filteredCases.length === 0) {

        complaintTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty">
                    No matching complaints found.
                </td>
            </tr>
        `;

        return;

    }


    complaintTableBody.innerHTML = filteredCases.map(complaint => {

        const screeningStatus =
            complaint.screeningStatus || "Not screened";

        return `
            <tr>

                <td>
                    <span class="table-case-id">
                        ${escapeHTML(complaint.caseId)}
                    </span>
                </td>

                <td>
                    <span class="table-main-text">
                        ${escapeHTML(complaint.complainantName)}
                    </span>

                    <span class="table-sub-text">
                        ${escapeHTML(complaint.complainantContact)}
                    </span>
                </td>

                <td>
                    ${escapeHTML(complaint.disputeType)}
                </td>

                <td>
                    <span class="secretary-status screening">
                        ${escapeHTML(screeningStatus)}
                    </span>
                </td>

                <td>
                    <span class="secretary-status ${getStatusClass(complaint.status)}">
                        ${escapeHTML(complaint.status)}
                    </span>
                </td>

                <td>
                    <button
                        class="secretary-view-button"
                        data-view-case="${escapeHTML(complaint.caseId)}"
                    >
                        View Details
                    </button>
                </td>

            </tr>
        `;

    }).join("");

}


// 11. DISPLAY COMPLAINT DETAILS

function renderComplaintDetails(caseId) {

    const complaint = findCase(caseId);

    if (!complaint) {

        complaintDetailsContent.innerHTML = `
            <div class="secretary-empty">
                <h3>Complaint not found</h3>
                <p>This complaint may no longer exist in browser storage.</p>
            </div>
        `;

        return;

    }


    const answers = complaint.screeningAnswers || {};

    const reasons = complaint.screeningReasons || [];

    const warnings = complaint.screeningWarnings || [];


    const screeningAnswersHTML = Object.entries(answers).map(
        ([question, answer]) => {

            return `
                <div class="detail-field">
                    <label>${escapeHTML(question)}</label>
                    <p>${escapeHTML(answer)}</p>
                </div>
            `;

        }
    ).join("");


    const reasonsHTML = reasons.length > 0

        ? reasons.map(reason => `
            <div class="screening-observation">
                ${escapeHTML(reason)}
            </div>
        `).join("")

        : "<p>No specific exclusion was identified by the prototype.</p>";


    const warningsHTML = warnings.length > 0

        ? warnings.map(warning => `
            <div class="screening-observation">
                ${escapeHTML(warning)}
            </div>
        `).join("")

        : "<p>No additional warnings recorded.</p>";


    complaintDetailsContent.innerHTML = `

        <div class="details-grid">

            <div class="detail-card">

                <h3>Complainant Information</h3>

                <div class="detail-field">
                    <label>Full Name</label>
                    <p>${escapeHTML(complaint.complainantName)}</p>
                </div>

                <div class="detail-field">
                    <label>Contact Number</label>
                    <p>${escapeHTML(complaint.complainantContact)}</p>
                </div>

                <div class="detail-field">
                    <label>City / Municipality</label>
                    <p>${escapeHTML(answers.complainantMunicipality || "Not provided")}</p>
                </div>

                <div class="detail-field">
                    <label>Barangay</label>
                    <p>${escapeHTML(answers.complainantBarangay || "Not provided")}</p>
                </div>

            </div>


            <div class="detail-card">

                <h3>Respondent Information</h3>

                <div class="detail-field">
                    <label>Full Name</label>
                    <p>${escapeHTML(complaint.respondentName)}</p>
                </div>

                <div class="detail-field">
                    <label>Address</label>
                    <p>${escapeHTML(complaint.respondentAddress || "Not provided")}</p>
                </div>

                <div class="detail-field">
                    <label>City / Municipality</label>
                    <p>${escapeHTML(answers.respondentMunicipality || "Not provided")}</p>
                </div>

                <div class="detail-field">
                    <label>Barangay</label>
                    <p>${escapeHTML(answers.respondentBarangay || "Not provided")}</p>
                </div>

            </div>


            <div class="detail-card detail-wide">

                <h3>Complaint Information</h3>

                <div class="detail-field">
                    <label>Case ID</label>
                    <p>${escapeHTML(complaint.caseId)}</p>
                </div>

                <div class="detail-field">
                    <label>Dispute Type</label>
                    <p>${escapeHTML(complaint.disputeType)}</p>
                </div>

                <div class="detail-field">
                    <label>Incident Details</label>
                    <p>${escapeHTML(complaint.incidentDetails)}</p>
                </div>

                <div class="detail-field">
                    <label>Date Submitted</label>
                    <p>${escapeHTML(complaint.dateSubmitted)}</p>
                </div>

            </div>


            <div class="detail-card detail-wide">

                <h3>Preliminary Screening Result</h3>

                <div class="detail-field">
                    <label>Automated Screening Status</label>
                    <p>${escapeHTML(complaint.screeningStatus || "Not screened")}</p>
                </div>

                <h4>Screening Observations</h4>
                ${reasonsHTML}

                <h4>Warnings and Additional Notes</h4>
                ${warningsHTML}

                <div class="screening-disclaimer">
                    This is an automated preliminary screening record.
                    It is not an official legal determination. The
                    Secretary must verify the facts and refer legal
                    questions to the appropriate authority.
                </div>

            </div>


            <div class="detail-card detail-wide">

                <h3>Screening Answers</h3>

                ${screeningAnswersHTML || "<p>No screening answers recorded.</p>"}

            </div>

        </div>


        <div class="secretary-action-card">

            <h3>Administrative Review</h3>

            <p>
                Update the administrative status after reviewing
                the complaint. These actions do not make a final
                legal jurisdiction decision.
            </p>

            <label for="newCaseStatus">Administrative Status</label>

            <select id="newCaseStatus">

                <option value="Pending Review">
                    Pending Review
                </option>

                <option value="Under Review">
                    Under Review
                </option>

                <option value="Awaiting Clarification">
                    Awaiting Clarification
                </option>

                <option value="Ready for Lupon Assessment">
                    Ready for Lupon Assessment
                </option>

            </select>


            <label for="secretaryNotes">Secretary's Review Notes</label>

            <textarea
                id="secretaryNotes"
                rows="4"
                placeholder="Enter review notes or information needed..."
            >${escapeHTML(complaint.secretaryNotes || "")}</textarea>


            <button
                class="secretary-primary-button"
                id="saveSecretaryReview"
                data-case-id="${escapeHTML(complaint.caseId)}"
            >
                Save Administrative Review
            </button>

                        <p id="secretaryActionMessage" class="secretary-action-message"></p>

        </div>


        <!-- LUPON ASSIGNMENT -->

        <div class="secretary-action-card">

            <h3>Assign to Lupon Member</h3>

            <p>
                Select a registered Lupon member to handle
                this complaint.
            </p>

            <label for="luponMemberSelect">
                Available Lupon Members
            </label>

            <select id="luponMemberSelect">
                <option value="">Loading Lupon members...</option>
            </select>

            <button
                type="button"
                class="secretary-primary-button"
                id="assignLuponButton"
                data-case-id="${escapeHTML(complaint.caseId)}"
            >
                Assign Case
            </button>

            <p
                id="luponAssignmentMessage"
                class="secretary-action-message"
            ></p>

        </div>

    `;


    // Set current administrative status
    document.getElementById("newCaseStatus").value =
        complaint.status || "Pending Review";


    // Attach save action
    document.getElementById("saveSecretaryReview")
        .addEventListener("click", saveSecretaryReview);
    // Load available Lupon members
loadLuponMembers();

// Attach case assignment action
document.getElementById("assignLuponButton")
    .addEventListener("click", assignCaseToLupon);
}

// ======================================
// LOAD LUPON MEMBERS
// ======================================

async function loadLuponMembers() {

    const select = document.getElementById(
        "luponMemberSelect"
    );

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">Loading Lupon members...</option>
    `;

    try {

        const response = await fetch(
            `${window.API.roles}/lupon-members`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load Lupon members."
            );
        }

        if (data.members.length === 0) {

            select.innerHTML = `
                <option value="">No Lupon members registered</option>
            `;

            return;

        }

        select.innerHTML = `
            <option value="">Select a Lupon member</option>
        `;

        data.members.forEach(member => {

            const option = document.createElement("option");

            option.value = member.id;

            option.textContent =
                `${member.fullName} (${member.email})`;

            select.appendChild(option);

        });

    } catch (error) {

        console.error("Lupon member loading error:", error);

        select.innerHTML = `
            <option value="">Unable to load Lupon members</option>
        `;

    }

}


// ======================================
// ASSIGN CASE TO LUPON MEMBER
// ======================================

async function assignCaseToLupon() {
    console.log("ASSIGN BUTTON CLICKED");
    const button = document.getElementById(
        "assignLuponButton"
    );

    const select = document.getElementById(
        "luponMemberSelect"
    );

    const message = document.getElementById(
        "luponAssignmentMessage"
    );

    const caseId = button.dataset.caseId;

    const complaint = findCase(caseId);

    const luponUserId = Number(select.value);

    if (!complaint || !complaint.backendId) {

        message.textContent =
            "Complaint not found. Please reload the dashboard.";

        message.className =
            "secretary-action-message error";

        return;

    }

    if (!select.value) {

        message.textContent =
            "Please select a Lupon member first.";

        message.className =
            "secretary-action-message error";

        return;

    }

    button.disabled = true;
    button.textContent = "Assigning...";

    try {

        const response = await fetch(
            `${window.API.cases}/${complaint.backendId}/assign`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    luponUserId: luponUserId
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Unable to assign this complaint."
            );

        }

        message.textContent =
            "Case successfully assigned to the selected Lupon member!";
        console.log("ASSIGNMENT SUCCESS - CURRENT URL:", window.location.href);
        message.className =
            "secretary-action-message success";

    } catch (error) {

        console.error("Lupon assignment error:", error);

        message.textContent =
            error.message || "Unable to connect to the backend.";

        message.className =
            "secretary-action-message error";

    } finally {

        button.disabled = false;
        button.textContent = "Assign Case";

    }

}

// 12. SAVE SECRETARY REVIEW

async function saveSecretaryReview() {

    const button = document.getElementById(
        "saveSecretaryReview"
    );

    const caseId = button.dataset.caseId;

    const complaint = findCase(caseId);

    const newStatus = document.getElementById(
        "newCaseStatus"
    ).value;

    const secretaryNotes = document.getElementById(
        "secretaryNotes"
    ).value.trim();

    const message = document.getElementById(
        "secretaryActionMessage"
    );

    if (!complaint) {

        message.textContent = "Complaint not found.";

        message.className = "secretary-action-message error";

        return;

    }

    if (!complaint.backendId) {

        message.textContent =
            "Database ID is missing. Please reload the dashboard.";

        message.className = "secretary-action-message error";

        return;

    }

    const validStatuses = [
        "Pending Review",
        "Under Review",
        "Awaiting Clarification",
        "Ready for Lupon Assessment"
    ];

    if (!validStatuses.includes(newStatus)) {

        message.textContent = "Invalid administrative status.";

        message.className = "secretary-action-message error";

        return;

    }

    // Prevent repeated clicks while saving.
    button.disabled = true;
    button.textContent = "Saving...";

    try {

        // Send the administrative review to the backend.
        const response = await fetch(
            `${window.API.cases}/${complaint.backendId}/status`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    status: newStatus,
                    secretaryNotes: secretaryNotes
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Unable to save administrative review."
            );

        }

        // Retrieve the updated official database records.
        await loadCases();

        // Refresh dashboard information.
        renderStatistics();

        renderRecentComplaints();

        renderComplaintTable();

        message.textContent =
            "Administrative review saved successfully!";

        message.className =
            "secretary-action-message success";

    } catch (error) {

        console.error(
            "Administrative review error:",
            error
        );

        message.textContent =
            error.message || "Unable to connect to the backend.";

        message.className =
            "secretary-action-message error";

    } finally {

        button.disabled = false;
        button.textContent = "Save Administrative Review";

    }

}



// 13. HANDLE VIEW BUTTONS

document.addEventListener("click", function(event) {

    const viewButton = event.target.closest("[data-view-case]");

    if (!viewButton) {
        return;
    }

    const caseId = viewButton.dataset.viewCase;

    renderComplaintDetails(caseId);

    showSecretaryPage("details");

});


// 14. SEARCH AND FILTER EVENTS

complaintSearch.addEventListener("input", function() {

    renderComplaintTable();

});


statusFilter.addEventListener("change", function() {

    renderComplaintTable();

});


// 15. INITIALIZE DASHBOARD


async function initializeSecretaryDashboard() {

    // First, retrieve complaints from SQLite.
    await loadCases();

    // Then display the retrieved records.
    renderStatistics();

    renderRecentComplaints();

    renderComplaintTable();

    const initialPage = window.location.hash.replace("#", "");

    const validPages = [
        "overview",
        "complaints"
    ];

    if (validPages.includes(initialPage)) {

        showSecretaryPage(initialPage);

    } else {

        showSecretaryPage("overview");

    }

}


console.log("SECRETARY DASHBOARD SCRIPT LOADED");
initializeSecretaryDashboard();
