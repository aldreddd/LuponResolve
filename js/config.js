
// ======================================
// LUPONRESOLVE API CONFIGURATION
// ======================================

// Detect local development regardless of Live Server port.
const isLocalDevelopment = [
    "127.0.0.1",
    "localhost"
].includes(window.location.hostname);

// Local development uses the separate Express backend.
// Production uses the same domain as the frontend.

window.API_BASE_URL = isLocalDevelopment
    ? "http://127.0.0.1:3000"
    : "";


// ======================================
// API ENDPOINT SHORTCUTS
// ======================================

window.API = {
    auth: `${window.API_BASE_URL}/api/auth`,
    cases: `${window.API_BASE_URL}/api/cases`,
    roles: `${window.API_BASE_URL}/api/roles`,
    hearings: `${window.API_BASE_URL}/api/hearings`,
    admin: `${window.API_BASE_URL}/api/admin`
};
