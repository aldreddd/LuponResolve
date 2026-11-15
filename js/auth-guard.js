
// ======================================
// LUPONRESOLVE DASHBOARD AUTH GUARD
// ======================================

const AUTH_API = "http://127.0.0.1:3000/api/auth";

// Define which roles can access each protected page
const pagePermissions = {
    "secretary.html": ["secretary", "admin"],
    "workflow.html": ["secretary", "admin"],
    "lupon.html": ["lupon", "admin"],
    "resident.html": ["resident", "admin"],
};

// Identify the current page
const currentPage = window.location.pathname
    .split("/")
    .pop()
    .toLowerCase();

// Get the permitted roles for this page
const allowedRoles = pagePermissions[currentPage];

// Hide the page while checking authentication
document.documentElement.style.visibility = "hidden";

function showVerificationError(error) {
    console.error("Dashboard authentication error:", error);

    const renderError = () => {
        const message = document.createElement("main");
        message.setAttribute("role", "alert");
        message.style.cssText =
            "max-width: 36rem; margin: 15vh auto; padding: 2rem; font: 16px/1.5 sans-serif;";

        const heading = document.createElement("h1");
        heading.textContent = "Unable to verify your login";

        const description = document.createElement("p");
        description.textContent =
            "The server could not verify your account. Check that the backend is running, then try again.";

        const retryButton = document.createElement("button");
        retryButton.type = "button";
        retryButton.textContent = "Try again";
        retryButton.addEventListener("click", () => window.location.reload());

        message.append(heading, description, retryButton);
        document.body.replaceChildren(message);
        document.documentElement.style.visibility = "visible";
    };

    if (document.body) {
        renderError();
    } else {
        document.addEventListener("DOMContentLoaded", renderError, { once: true });
    }
}

async function verifyDashboardAccess() {

    // Pages without configured permissions are not protected.
    if (!allowedRoles) {
        document.documentElement.style.visibility = "visible";
        return;
    }

    try {

        const response = await fetch(`${AUTH_API}/me`, {
            method: "GET",
            credentials: "include",
            cache: "no-store"
        });

        // No valid login session
        if (response.status === 401) {
            window.location.replace("auth.html");
            return;
        }

        if (!response.ok) {
            throw new Error(`Unable to verify your account (HTTP ${response.status}).`);
        }

        const data = await response.json();

        if (!data.success || !data.user) {
            throw new Error("The server returned an invalid account response.");
        }

        const userRole = data.user.role;

        // Check the user's role against this page's permissions
        if (!allowedRoles.includes(userRole)) {

            const roleDestinations = {
                resident: "resident.html",
                secretary: "secretary.html",
                lupon: "lupon.html"
            };

            const destination = roleDestinations[userRole];

            if (destination && destination !== currentPage) {
                window.location.replace(destination);
                return;
            }

            window.location.replace("auth.html");
            return;
        }

        // Authentication and authorization checks passed
        document.documentElement.style.visibility = "visible";

    } catch (error) {
        showVerificationError(error);
    }

}


// Run the guard
verifyDashboardAccess();


// ======================================
// LOGOUT FUNCTIONALITY
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    const logoutButton = document.getElementById("logoutButton");

    if (!logoutButton) return;

    logoutButton.addEventListener("click", async () => {

        const confirmLogout = confirm(
            "Are you sure you want to log out?"
        );

        if (!confirmLogout) return;

        logoutButton.disabled = true;
        logoutButton.textContent = "Logging out...";

        try {

            const response = await fetch(`${AUTH_API}/logout`, {
                method: "POST",
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Logout failed.");
            }

            window.location.replace("auth.html");

        } catch (error) {

            console.error("Logout error:", error);

            alert("Unable to log out. Please try again.");

            logoutButton.disabled = false;
            logoutButton.innerHTML = "<span>↪</span> Log Out";

        }

    });

});
