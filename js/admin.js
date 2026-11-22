
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

    usersTableBody.innerHTML = "";

    if (filteredUsers.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 4;

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


        nameCell.textContent = user.fullName;

        emailCell.textContent = user.email;

        const roleBadge = document.createElement("span");

        roleBadge.className = `user-role-badge ${user.role}`;

        roleBadge.textContent = formatStaffRole(user.role);

        roleCell.appendChild(roleBadge);

        dateCell.textContent = formatUserRegistrationDate(
            user.createdAt
        );


        row.appendChild(nameCell);

        row.appendChild(emailCell);

        row.appendChild(roleCell);

        row.appendChild(dateCell);

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
                <td colspan="4">Loading staff accounts...</td>
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
                <td colspan="4">
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

loadStaffUsers();
