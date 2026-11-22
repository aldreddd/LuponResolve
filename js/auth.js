
// ======================================
// LUPONRESOLVE — STAFF AUTHENTICATION
// ======================================

const API_URL = window.API.auth;


// ======================================
// GET HTML ELEMENTS
// ======================================

const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");

const formTitle = document.getElementById("formTitle");
const formDescription = document.getElementById("formDescription");

const authMessage = document.getElementById("authMessage");


// ======================================
// DISPLAY MESSAGES
// ======================================

function showMessage(message, type) {
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`;
}

function hideMessage() {
    authMessage.textContent = "";
    authMessage.className = "auth-message hidden";
}


// ======================================
// ROLE-BASED REDIRECTION
// ======================================


// ======================================
// ROLE-BASED REDIRECTION
// ======================================

function redirectByRole(role) {

    const destinations = {
        secretary: "secretary.html",
        lupon: "lupon.html",
        admin: "admin.html"
    };

    if (role === "resident") {
        showMessage(
            "Resident accounts no longer use login. You may file a complaint through the public complaint form.",
            "error"
        );
        return;
    }

    const destination = destinations[role];

    if (!destination) {
        showMessage(
            "Your account has an unrecognized role. Please contact the administrator.",
            "error"
        );
        return;
    }

    window.location.href = destination;
}



// ======================================
// LOGIN
// ======================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();
    hideMessage();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    loginButton.disabled = true;
    loginButton.textContent = "Signing in...";

    try {

        const response = await fetch(`${API_URL}/login`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || "Login failed.", "error");
            return;
        }

        showMessage(data.message || "Login successful!", "success");

        redirectByRole(data.user.role);

    } catch (error) {

        console.error("Login error:", error);

        showMessage(
            "Cannot connect to the server. Make sure your backend is running.",
            "error"
        );

    } finally {

        loginButton.disabled = false;
        loginButton.textContent = "Sign In";

    }

});


// ======================================
// CHECK EXISTING SESSION
// ======================================

async function checkExistingSession() {

    try {

        const response = await fetch(`${API_URL}/me`, {
            method: "GET",
            credentials: "include",
            cache: "no-store"
        });

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        if (data.success && data.user) {
            redirectByRole(data.user.role);
        }

    } catch (error) {

        console.error("Session check failed:", error);

    }

}


// ======================================
// INITIALIZE
// ======================================

checkExistingSession();