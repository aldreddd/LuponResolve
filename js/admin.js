
/* ======================================
   LUPONRESOLVE ADMIN DASHBOARD
====================================== */

const ADMIN_API = window.API.admin;


// ======================================
// GET HTML ELEMENTS
// ======================================

const dashboardMessage = document.getElementById("dashboardMessage");
const refreshButton = document.getElementById("refreshButton");
const recentCasesBody = document.getElementById("recentCasesBody");


// ======================================
// DISPLAY MESSAGE
// ======================================

function showDashboardMessage(message) {

    dashboardMessage.textContent = message;
    dashboardMessage.classList.remove("hidden");

}

function hideDashboardMessage() {

    dashboardMessage.textContent = "";
    dashboardMessage.classList.add("hidden");

}


// ======================================
// FORMAT DATE
// ======================================

function formatDate(dateValue) {

    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });

}


// ======================================
// UPDATE STATISTICS
// ======================================

function updateDashboardStats(stats) {

    const cases = stats.cases;
    const staff = stats.staff;

    document.getElementById("totalCases").textContent = cases.total;
    document.getElementById("pendingCases").textContent = cases.pending;
    document.getElementById("activeCases").textContent = cases.activeProceedings;
    document.getElementById("resolvedCases").textContent = cases.resolved;

    document.getElementById("secretaryCount").textContent = staff.secretaries;
    document.getElementById("luponCount").textContent = staff.luponMembers;
    document.getElementById("administratorCount").textContent = staff.administrators;
    document.getElementById("totalStaff").textContent = staff.total;

    document.getElementById("underReviewCases").textContent = cases.underReview;
    document.getElementById("awaitingCases").textContent = cases.awaitingClarification;
    document.getElementById("readyCases").textContent = cases.readyForLupon;
    document.getElementById("certificateCases").textContent = cases.certificateToFileAction;
    document.getElementById("closedCases").textContent = cases.closed;

}


// ======================================
// GET STATUS CLASS
// ======================================

function getStatusClass(status) {

    if (
        status === "Resolved" ||
        status === "Closed"
    ) {
        return "resolved";
    }

    if (
        status === "Pending Review" ||
        status === "Awaiting Clarification"
    ) {
        return "pending";
    }

    return "active";

}


// ======================================
// DISPLAY RECENT CASES
// ======================================

function renderRecentCases(cases) {

    recentCasesBody.replaceChildren();

    if (!cases || cases.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "empty-state";
        cell.textContent = "No case records available.";

        row.appendChild(cell);
        recentCasesBody.appendChild(row);

        return;

    }

    cases.forEach(item => {

        const row = document.createElement("tr");

        const values = [
            item.caseNumber || "—",
            item.disputeType || "—",
            item.status || "—",
            item.caseStage || "—",
            formatDate(item.createdAt)
        ];

        values.forEach((value, index) => {

            const cell = document.createElement("td");

            if (index === 0) {

                cell.className = "case-number";

            }

            if (index === 2) {

                const badge = document.createElement("span");

                badge.className = `status-badge ${getStatusClass(value)}`;
                badge.textContent = value;

                cell.appendChild(badge);

            } else {

                cell.textContent = value;

            }

            row.appendChild(cell);

        });

        recentCasesBody.appendChild(row);

    });

}


// ======================================
// LOAD ADMINISTRATOR OVERVIEW
// ======================================

async function loadAdminOverview() {

    hideDashboardMessage();

    refreshButton.disabled = true;
    refreshButton.textContent = "Loading...";

    try {

        const response = await fetch(`${ADMIN_API}/overview`, {

            method: "GET",

            credentials: "include",

            cache: "no-store"

        });

        const data = await response.json();

        if (response.status === 401) {

            window.location.replace("auth.html");
            return;

        }

        if (response.status === 403) {

            window.location.replace("auth.html");
            return;

        }

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Unable to retrieve dashboard information."
            );

        }

        updateDashboardStats(data.stats);

        renderRecentCases(data.recentCases);

    } catch (error) {

        console.error("Administrator dashboard error:", error);

        showDashboardMessage(
            error.message || "Unable to load administrator dashboard."
        );

    } finally {

        refreshButton.disabled = false;
        refreshButton.textContent = "↻ Refresh Data";

    }

}


// ======================================
// LOAD ADMIN PROFILE
// ======================================

async function loadAdminProfile() {

    try {

        const response = await fetch(`${window.API.auth}/me`, {

            method: "GET",

            credentials: "include",

            cache: "no-store"

        });

        if (!response.ok) return;

        const data = await response.json();

        if (data.success && data.user) {

            const adminName = document.getElementById("adminName");
            const headerAvatar = document.querySelector(".header-avatar");
            const profileAvatar = document.querySelector(".profile-avatar");

            adminName.textContent = data.user.fullName || "Administrator";

            const initial = (data.user.fullName || "A")
                .trim()
                .charAt(0)
                .toUpperCase();

            headerAvatar.textContent = initial;
            profileAvatar.textContent = initial;

        }

    } catch (error) {

        console.error("Administrator profile error:", error);

    }

}


// ======================================
// NAVIGATION ACTIVE STATE
// ======================================

document.querySelectorAll(".nav-link").forEach(link => {

    link.addEventListener("click", () => {

        document.querySelectorAll(".nav-link").forEach(item => {
            item.classList.remove("active");
        });

        link.classList.add("active");

    });

});


// ======================================
// REFRESH BUTTON
// ======================================

refreshButton.addEventListener("click", loadAdminOverview);


// ======================================
// INITIALIZE
// ======================================

loadAdminProfile();
loadAdminOverview();

// ======================================
// ADMINISTRATOR — USER MANAGEMENT
// ======================================

// HTML ELEMENTS

const usersTableBody = document.getElementById("usersTableBody");

const usersMessage = document.getElementById("usersMessage");

const userCount = document.getElementById("userCount");

const userSearchInput = document.getElementById("userSearchInput");

const userRoleFilter = document.getElementById("userRoleFilter");

const refreshUsersButton = document.getElementById("refreshUsersButton");

const showCreateUserButton = document.getElementById("showCreateUserButton");

const cancelCreateUserButton = document.getElementById("cancelCreateUserButton");

const resetCreateUserButton = document.getElementById("resetCreateUserButton");

const createUserPanel = document.getElementById("createUserPanel");

const createUserForm = document.getElementById("createUserForm");

const createUserSubmitButton = document.getElementById("createUserSubmitButton");


// EDIT STAFF ACCOUNT ELEMENTS

const editUserPanel = document.getElementById("editUserPanel");
const editUserForm = document.getElementById("editUserForm");

const editUserFullName = document.getElementById("editUserFullName");
const editUserEmail = document.getElementById("editUserEmail");
const editUserRole = document.getElementById("editUserRole");

const editUserSubmitButton = document.getElementById("editUserSubmitButton");

const cancelEditUserButton = document.getElementById("cancelEditUserButton");
const cancelEditUserFormButton = document.getElementById("cancelEditUserFormButton");


// RESET PASSWORD ELEMENTS

const resetPasswordPanel = document.getElementById("resetPasswordPanel");
const resetPasswordForm = document.getElementById("resetPasswordForm");

const resetPasswordDescription = document.getElementById("resetPasswordDescription");

const resetNewPassword = document.getElementById("resetNewPassword");
const resetConfirmPassword = document.getElementById("resetConfirmPassword");

const resetPasswordSubmitButton = document.getElementById("resetPasswordSubmitButton");

const cancelResetPasswordButton = document.getElementById("cancelResetPasswordButton");
const cancelResetPasswordFormButton = document.getElementById("cancelResetPasswordFormButton");


// SELECTED STAFF ACCOUNT IDs

let editingUserId = null;
let resettingUserId = null;


// STAFF ACCOUNT DATA

let staffUsers = [];


// ======================================
// DISPLAY USER MANAGEMENT MESSAGE
// ======================================

function showUsersMessage(message, type = "success") {

    usersMessage.textContent = message;

    usersMessage.className = `dashboard-message ${type}`;

    usersMessage.classList.remove("hidden");

}


function hideUsersMessage() {

    usersMessage.textContent = "";

    usersMessage.classList.add("hidden");

}


// ======================================
// FORMAT STAFF ROLE
// ======================================

function formatStaffRole(role) {

    if (role === "secretary") {
        return "Secretary";
    }

    if (role === "lupon") {
        return "Lupon Member";
    }

    return role;
}


// ======================================
// FORMAT REGISTRATION DATE
// ======================================

function formatUserRegistrationDate(date) {

    if (!date) {
        return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return parsedDate.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });

}

// ======================================
// RENDER STAFF ACCOUNTS
// ======================================

function renderStaffUsers() {

    const searchTerm = userSearchInput.value
        .trim()
        .toLowerCase();

    const selectedRole = userRoleFilter.value;

    const filteredUsers = staffUsers.filter(user => {

        const matchesSearch =
            user.fullName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);

        const matchesRole =
            selectedRole === "all" ||
            user.role === selectedRole;

        return matchesSearch && matchesRole;

    });

    userCount.textContent = filteredUsers.length;

    usersTableBody.replaceChildren();

    if (filteredUsers.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;

        cell.textContent = staffUsers.length === 0
            ? "No staff accounts found."
            : "No matching staff accounts.";

        row.appendChild(cell);
        usersTableBody.appendChild(row);

        return;

    }

    filteredUsers.forEach(user => {

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        const emailCell = document.createElement("td");
        const roleCell = document.createElement("td");
        const dateCell = document.createElement("td");
        const actionsCell = document.createElement("td");

        // Staff name
        nameCell.textContent = user.fullName;

        // Staff email
        emailCell.textContent = user.email;

        // Role badge
        const roleBadge = document.createElement("span");

        roleBadge.className = `user-role-badge ${user.role}`;
        roleBadge.textContent = formatStaffRole(user.role);

        roleCell.appendChild(roleBadge);

        // Registration date
        dateCell.textContent = formatUserRegistrationDate(
            user.createdAt
        );

        // Edit button
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "secondary-button staff-action-button";
        editButton.textContent = "Edit";
        editButton.dataset.action = "edit";
        editButton.dataset.userId = user.id;

        editButton.setAttribute(
            "aria-label",
            `Edit ${user.fullName}`
        );

        // Reset password button
        const passwordButton = document.createElement("button");

        passwordButton.type = "button";
        passwordButton.className = "primary-button staff-action-button";
        passwordButton.textContent = "Reset Password";
        passwordButton.dataset.action = "reset-password";
        passwordButton.dataset.userId = user.id;

        passwordButton.setAttribute(
            "aria-label",
            `Reset password for ${user.fullName}`
        );

        actionsCell.className = "staff-actions-cell";

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(passwordButton);

        // Assemble row
        row.appendChild(nameCell);
        row.appendChild(emailCell);
        row.appendChild(roleCell);
        row.appendChild(dateCell);
        row.appendChild(actionsCell);

        usersTableBody.appendChild(row);

    });

}



// ======================================
// LOAD STAFF ACCOUNTS
// GET /api/admin/users
// ======================================

async function loadStaffUsers() {

    try {

        usersTableBody.innerHTML = `
            <tr>
                <td colspan="5">Loading staff accounts...</td>
            </tr>
        `;

        const response = await fetch(
            `${ADMIN_API}/users`,
            {
                method: "GET",
                credentials: "include",
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {

            window.location.href = "auth.html";

            return;

        }

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Unable to load staff accounts."
            );

        }

        staffUsers = data.users.map(user => ({
            ...user,
            fullName: user.fullName || "",
            email: user.email || ""
        }));

        renderStaffUsers();

    } catch (error) {

        console.error(
            "Staff account loading error:",
            error
        );

        usersTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load staff accounts.
                </td>
            </tr>
        `;

        showUsersMessage(
            error.message,
            "error"
        );

    }

}


// ======================================
// SHOW CREATE ACCOUNT FORM
// ======================================

showCreateUserButton.addEventListener("click", () => {

    createUserPanel.classList.remove("hidden");

    hideUsersMessage();

    createUserPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

});


// ======================================
// HIDE CREATE ACCOUNT FORM
// ======================================

cancelCreateUserButton.addEventListener("click", () => {

    createUserForm.reset();

    createUserPanel.classList.add("hidden");

    hideUsersMessage();

});


resetCreateUserButton.addEventListener("click", () => {

    createUserForm.reset();

    hideUsersMessage();

});


// ======================================
// SEARCH STAFF
// ======================================

userSearchInput.addEventListener("input", () => {

    renderStaffUsers();

});


// ======================================
// FILTER STAFF BY ROLE
// ======================================

userRoleFilter.addEventListener("change", () => {

    renderStaffUsers();

});


// ======================================
// REFRESH STAFF DIRECTORY
// ======================================

refreshUsersButton.addEventListener("click", () => {

    hideUsersMessage();

    loadStaffUsers();

});


// ======================================
// CREATE STAFF ACCOUNT
// POST /api/admin/users
// ======================================

createUserForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    hideUsersMessage();


    const fullName = document
        .getElementById("newUserFullName")
        .value
        .trim();

    const email = document
        .getElementById("newUserEmail")
        .value
        .trim();

    const role = document
        .getElementById("newUserRole")
        .value;

    const password = document
        .getElementById("newUserPassword")
        .value;

    const confirmPassword = document
        .getElementById("confirmUserPassword")
        .value;


    // ----------------------------------
    // PASSWORD CONFIRMATION
    // ----------------------------------

    if (password !== confirmPassword) {

        showUsersMessage(
            "Passwords do not match.",
            "error"
        );

        return;

    }


    // ----------------------------------
    // DISABLE SUBMIT BUTTON
    // ----------------------------------

    createUserSubmitButton.disabled = true;

    createUserSubmitButton.textContent = "Creating Account...";


    try {

        const response = await fetch(
            `${ADMIN_API}/users`,
            {
                method: "POST",

                credentials: "include",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    fullName,
                    email,
                    password,
                    role
                })

            }
        );


        const data = await response.json();


        if (response.status === 401 || response.status === 403) {

            window.location.href = "auth.html";

            return;

        }


        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Unable to create staff account."
            );

        }


        // ----------------------------------
        // SUCCESS
        // ----------------------------------

        createUserForm.reset();

        createUserPanel.classList.add("hidden");

        showUsersMessage(
            data.message || "Staff account created successfully.",
            "success"
        );

        await loadStaffUsers();

    } catch (error) {

        console.error(
            "Staff account creation error:",
            error
        );

        showUsersMessage(
            error.message,
            "error"
        );

    } finally {

        createUserSubmitButton.disabled = false;

        createUserSubmitButton.textContent = "Create Account";

    }

});


// ======================================
// INITIALIZE USER MANAGEMENT
// ======================================

// ======================================
// STAFF ACCOUNT ACTIONS
// ======================================


// ======================================
// CLOSE EDIT PANEL
// ======================================

function closeEditUserPanel() {

    editUserForm.reset();

    editUserPanel.classList.add("hidden");

    editingUserId = null;

}


// ======================================
// CLOSE RESET PASSWORD PANEL
// ======================================

function closeResetPasswordPanel() {

    resetPasswordForm.reset();

    resetPasswordPanel.classList.add("hidden");

    resettingUserId = null;

}


// ======================================
// SHOW EDIT STAFF ACCOUNT PANEL
// ======================================

function openEditUserPanel(user) {

    closeResetPasswordPanel();

    editingUserId = user.id;

    editUserFullName.value = user.fullName;
    editUserEmail.value = user.email;
    editUserRole.value = user.role;

    editUserPanel.classList.remove("hidden");

    hideUsersMessage();

    editUserPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ======================================
// SHOW RESET PASSWORD PANEL
// ======================================

function openResetPasswordPanel(user) {

    closeEditUserPanel();

    resettingUserId = user.id;

    resetPasswordForm.reset();

    resetPasswordDescription.textContent =
        `Set a new password for ${user.fullName}.`;

    resetPasswordPanel.classList.remove("hidden");

    hideUsersMessage();

    resetPasswordPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ======================================
// STAFF DIRECTORY ACTION HANDLER
// ======================================

usersTableBody.addEventListener("click", (event) => {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const userId = button.dataset.userId;

    const selectedUser = staffUsers.find(
        user => String(user.id) === String(userId)
    );

    if (!selectedUser) {

        showUsersMessage(
            "The selected staff account could not be found.",
            "error"
        );

        return;

    }

    if (button.dataset.action === "edit") {

        openEditUserPanel(selectedUser);

    }

    if (button.dataset.action === "reset-password") {

        openResetPasswordPanel(selectedUser);

    }

});


// ======================================
// CANCEL EDIT
// ======================================

cancelEditUserButton.addEventListener("click", closeEditUserPanel);

cancelEditUserFormButton.addEventListener("click", closeEditUserPanel);


// ======================================
// CANCEL PASSWORD RESET
// ======================================

cancelResetPasswordButton.addEventListener(
    "click",
    closeResetPasswordPanel
);

cancelResetPasswordFormButton.addEventListener(
    "click",
    closeResetPasswordPanel
);


// ======================================
// UPDATE STAFF ACCOUNT
// PUT /api/admin/users/:id
// ======================================

editUserForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!editingUserId) return;

    hideUsersMessage();

    const fullName = editUserFullName.value.trim();
    const email = editUserEmail.value.trim();
    const role = editUserRole.value;

    editUserSubmitButton.disabled = true;
    editUserSubmitButton.textContent = "Saving Changes...";

    try {

        const response = await fetch(
            `${ADMIN_API}/users/${encodeURIComponent(editingUserId)}`,
            {
                method: "PUT",

                credentials: "include",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    fullName,
                    email,
                    role
                })
            }
        );

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {

            window.location.href = "auth.html";
            return;

        }

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Unable to update staff account."
            );

        }

        closeEditUserPanel();

        await loadStaffUsers();

        showUsersMessage(
            data.message || "Staff account updated successfully.",
            "success"
        );

    } catch (error) {

        console.error("Staff account update error:", error);

        showUsersMessage(
            error.message || "Unable to update staff account.",
            "error"
        );

    } finally {

        editUserSubmitButton.disabled = false;
        editUserSubmitButton.textContent = "Save Changes";

    }

});


// ======================================
// RESET STAFF PASSWORD
// PATCH /api/admin/users/:id/password
// ======================================

resetPasswordForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!resettingUserId) return;

    hideUsersMessage();

    const password = resetNewPassword.value;
    const confirmPassword = resetConfirmPassword.value;

    // Check password confirmation
    if (password !== confirmPassword) {

        showUsersMessage(
            "Passwords do not match.",
            "error"
        );

        return;

    }

    if (password.length < 8) {

        showUsersMessage(
            "Password must contain at least 8 characters.",
            "error"
        );

        return;

    }

    resetPasswordSubmitButton.disabled = true;
    resetPasswordSubmitButton.textContent = "Resetting Password...";

    try {

        const response = await fetch(
            `${ADMIN_API}/users/${encodeURIComponent(resettingUserId)}/password`,
            {
                method: "PATCH",

                credentials: "include",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    password
                })
            }
        );

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {

            window.location.href = "auth.html";
            return;

        }

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Unable to reset staff password."
            );

        }

        closeResetPasswordPanel();

        showUsersMessage(
            data.message || "Staff password reset successfully.",
            "success"
        );

    } catch (error) {

        console.error("Staff password reset error:", error);

        showUsersMessage(
            error.message || "Unable to reset staff password.",
            "error"
        );

    } finally {

        resetPasswordSubmitButton.disabled = false;
        resetPasswordSubmitButton.textContent = "Reset Password";

    }

});


loadStaffUsers();


// ======================================
// ADMINISTRATOR — CASE OVERSIGHT
// ======================================


// ======================================
// CASE OVERSIGHT HTML ELEMENTS
// ======================================

const adminCasesTableBody = document.getElementById(
    "adminCasesTableBody"
);

const casesMessage = document.getElementById(
    "casesMessage"
);

const caseSearchInput = document.getElementById(
    "caseSearchInput"
);

const caseStatusFilter = document.getElementById(
    "caseStatusFilter"
);

const caseStageFilter = document.getElementById(
    "caseStageFilter"
);

const refreshCasesButton = document.getElementById(
    "refreshCasesButton"
);

const clearCaseFiltersButton = document.getElementById(
    "clearCaseFiltersButton"
);

const caseRecordCount = document.getElementById(
    "caseRecordCount"
);

const caseCurrentPage = document.getElementById(
    "caseCurrentPage"
);

const caseTotalPages = document.getElementById(
    "caseTotalPages"
);

const casePaginationInfo = document.getElementById(
    "casePaginationInfo"
);

const previousCasesPageButton = document.getElementById(
    "previousCasesPageButton"
);

const nextCasesPageButton = document.getElementById(
    "nextCasesPageButton"
);


// ======================================
// CASE OVERSIGHT STATE
// ======================================

let currentCasePage = 1;

const CASES_PER_PAGE = 10;

let totalCasePages = 1;

let caseSearchTimeout = null;


// ======================================
// DISPLAY CASE MESSAGE
// ======================================

function showCasesMessage(message, type = "error") {

    casesMessage.textContent = message;

    casesMessage.className = `dashboard-message ${type}`;

    casesMessage.classList.remove("hidden");

}


function hideCasesMessage() {

    casesMessage.textContent = "";

    casesMessage.classList.add("hidden");

}


// ======================================
// FORMAT CASE STATUS CLASS
// ======================================

function getCaseStatusBadgeClass(status) {

    if (
        status === "Resolved" ||
        status === "Closed"
    ) {
        return "resolved";
    }

    if (
        status === "Pending Review" ||
        status === "Awaiting Clarification"
    ) {
        return "pending";
    }

    return "active";

}


// ======================================
// FORMAT CASE DATE
// ======================================

function formatCaseSubmissionDate(dateValue) {

    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });

}


// ======================================
// CREATE TABLE CELL
// ======================================

function createCaseTableCell(value, className = "") {

    const cell = document.createElement("td");

    cell.textContent = value || "—";

    if (className) {
        cell.className = className;
    }

    return cell;

}


// ======================================
// RENDER CASE RECORDS
// ======================================

function renderAdminCases(cases) {

    adminCasesTableBody.replaceChildren();

    if (!cases || cases.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 7;

        cell.className = "empty-state";

        cell.textContent = "No matching case records found.";

        row.appendChild(cell);

        adminCasesTableBody.appendChild(row);

        return;

    }


    cases.forEach(item => {

        const row = document.createElement("tr");


        // CASE NUMBER

        const caseNumberCell = createCaseTableCell(
            item.caseNumber,
            "case-number"
        );


        // COMPLAINANT

        const complainantCell = createCaseTableCell(
            item.complainantName
        );


        // RESPONDENT

        const respondentCell = createCaseTableCell(
            item.respondentName
        );


        // DISPUTE TYPE

        const disputeCell = createCaseTableCell(
            item.disputeType
        );


        // CASE STATUS BADGE

        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");

        statusBadge.className =
            `status-badge ${getCaseStatusBadgeClass(item.status)}`;

        statusBadge.textContent = item.status || "Unknown";

        statusCell.appendChild(statusBadge);


        // WORKFLOW STAGE

        const stageCell = document.createElement("td");

        const stageBadge = document.createElement("span");

        stageBadge.className = "workflow-stage-badge";

        stageBadge.textContent = item.caseStage || "Not assigned";

        stageCell.appendChild(stageBadge);


        // SUBMISSION DATE

        const dateCell = createCaseTableCell(
            formatCaseSubmissionDate(item.createdAt)
        );


        // ASSEMBLE ROW

        row.appendChild(caseNumberCell);
        row.appendChild(complainantCell);
        row.appendChild(respondentCell);
        row.appendChild(disputeCell);
        row.appendChild(statusCell);
        row.appendChild(stageCell);
        row.appendChild(dateCell);

        adminCasesTableBody.appendChild(row);

    });

}


// ======================================
// UPDATE CASE PAGINATION
// ======================================

function updateCasePagination(pagination) {

    const totalCases = Number(pagination.totalCases) || 0;

    currentCasePage = Number(pagination.currentPage) || 1;

    totalCasePages = Math.max(
        1,
        Number(pagination.totalPages) || 1
    );


    caseRecordCount.textContent = totalCases;

    caseCurrentPage.textContent = currentCasePage;

    caseTotalPages.textContent = totalCasePages;


    // RECORD RANGE

    const startRecord = totalCases === 0
        ? 0
        : ((currentCasePage - 1) * CASES_PER_PAGE) + 1;

    const endRecord = Math.min(
        currentCasePage * CASES_PER_PAGE,
        totalCases
    );

    casePaginationInfo.textContent =
        `Showing ${startRecord}–${endRecord} of ${totalCases} cases`;


    // BUTTON STATES

    previousCasesPageButton.disabled =
        currentCasePage <= 1;

    nextCasesPageButton.disabled =
        currentCasePage >= totalCasePages;

}


// ======================================
// LOAD ADMINISTRATOR CASE RECORDS
// GET /api/admin/cases
// ======================================

async function loadAdminCases() {

    hideCasesMessage();

    refreshCasesButton.disabled = true;

    refreshCasesButton.textContent = "Loading...";


    adminCasesTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-state">
                Loading case records...
            </td>
        </tr>
    `;


    try {

        // ----------------------------------
        // BUILD QUERY PARAMETERS
        // ----------------------------------

        const params = new URLSearchParams({

            page: currentCasePage,

            limit: CASES_PER_PAGE

        });


        const search = caseSearchInput.value.trim();

        const status = caseStatusFilter.value;

        const caseStage = caseStageFilter.value;


        if (search) {
            params.set("search", search);
        }

        if (status) {
            params.set("status", status);
        }

        if (caseStage) {
            params.set("caseStage", caseStage);
        }


        // ----------------------------------
        // SEND REQUEST
        // ----------------------------------

        const response = await fetch(
            `${ADMIN_API}/cases?${params.toString()}`,
            {
                method: "GET",

                credentials: "include",

                cache: "no-store"
            }
        );


        const data = await response.json();


        // ----------------------------------
        // AUTHENTICATION CHECK
        // ----------------------------------

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            window.location.replace("auth.html");

            return;

        }


        // ----------------------------------
        // ERROR CHECK
        // ----------------------------------

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Unable to load case records."
            );

        }


        // ----------------------------------
        // UPDATE INTERFACE
        // ----------------------------------

        renderAdminCases(data.cases);

        updateCasePagination(data.pagination);


    } catch (error) {

        console.error(
            "Administrator case oversight error:",
            error
        );


        adminCasesTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    Unable to load case records.
                </td>
            </tr>
        `;


        showCasesMessage(
            error.message || "Unable to load case records.",
            "error"
        );


    } finally {

        refreshCasesButton.disabled = false;

        refreshCasesButton.textContent = "↻ Refresh Cases";

    }

}


// ======================================
// SEARCH CASE RECORDS
// ======================================

caseSearchInput.addEventListener("input", () => {

    clearTimeout(caseSearchTimeout);

    caseSearchTimeout = setTimeout(() => {

        currentCasePage = 1;

        loadAdminCases();

    }, 350);

});


// ======================================
// FILTER CASE STATUS
// ======================================

caseStatusFilter.addEventListener("change", () => {

    currentCasePage = 1;

    loadAdminCases();

});


// ======================================
// FILTER WORKFLOW STAGE
// ======================================

caseStageFilter.addEventListener("change", () => {

    currentCasePage = 1;

    loadAdminCases();

});


// ======================================
// CLEAR CASE FILTERS
// ======================================

clearCaseFiltersButton.addEventListener("click", () => {

    caseSearchInput.value = "";

    caseStatusFilter.value = "";

    caseStageFilter.value = "";

    currentCasePage = 1;

    loadAdminCases();

});


// ======================================
// REFRESH CASE RECORDS
// ======================================

refreshCasesButton.addEventListener("click", () => {

    loadAdminCases();

});


// ======================================
// PREVIOUS PAGE
// ======================================

previousCasesPageButton.addEventListener("click", () => {

    if (currentCasePage <= 1) return;

    currentCasePage--;

    loadAdminCases();

});


// ======================================
// NEXT PAGE
// ======================================

nextCasesPageButton.addEventListener("click", () => {

    if (currentCasePage >= totalCasePages) return;

    currentCasePage++;

    loadAdminCases();

});


// ======================================
// INITIALIZE CASE OVERSIGHT
// ======================================

let casesLoadedOnce = false;

document.querySelectorAll('.nav-link').forEach(link => {

    link.addEventListener("click", () => {

        if (link.getAttribute("href") === "#cases") {

            if (!casesLoadedOnce) {

                casesLoadedOnce = true;

                loadAdminCases();

            }

        }

    });

});