
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
