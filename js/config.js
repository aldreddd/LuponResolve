
// ======================================
// LUPONRESOLVE API CONFIGURATION
// ======================================

// Local development uses the separate Express server.
// Deployment uses the same domain as the frontend.

window.API_BASE_URL =
    window.location.port === "5500"
        ? "http://127.0.0.1:3000"
        : "";

// API endpoint shortcuts
window.API = {
    auth: `${window.API_BASE_URL}/api/auth`,
    cases: `${window.API_BASE_URL}/api/cases`,
    roles: `${window.API_BASE_URL}/api/roles`
};
