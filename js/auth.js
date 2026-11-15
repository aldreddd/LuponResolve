// ======================================
// LUPONRESOLVE AUTHENTICATION
// ======================================

// Backend API address
const API_URL = window.API.auth;


// ======================================
// GET HTML ELEMENTS
// ======================================

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showRegisterButton = document.getElementById("showRegister");
const showLoginButton = document.getElementById("showLogin");

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
// SWITCH BETWEEN LOGIN AND REGISTER
// ======================================

function showLoginForm() {

    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");

    formTitle.textContent = "Welcome back!";
    formDescription.textContent = "Sign in to access your account.";

    hideMessage();

}

function showRegistrationForm() {

    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");

    formTitle.textContent = "Create an account";
    formDescription.textContent = "Register as a LuponResolve resident.";

    hideMessage();

}

showRegisterButton.addEventListener("click", showRegistrationForm);
showLoginButton.addEventListener("click", showLoginForm);


// ======================================
// ROLE-BASED REDIRECTION
// ======================================

function redirectByRole(role) {

    const destinations = {
        resident: "resident.html",
        secretary: "secretary.html",
        lupon: "lupon.html"
    };

    if (role === "admin") {

        showMessage(
            "Login successful, but the Administrator Dashboard has not been built yet.",
            "success"
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

    const loginButton = document.getElementById("loginButton");

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

        showMessage(data.message, "success");

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
// REGISTRATION
// ======================================

registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    hideMessage();

    const registerButton = document.getElementById("registerButton");

    const fullName = document.getElementById("registerName").value.trim();

    const email = document.getElementById("registerEmail").value.trim();

    const password = document.getElementById("registerPassword").value;

    const confirmPassword = document.getElementById("confirmPassword").value;


    // Check whether passwords match
    if (password !== confirmPassword) {

        showMessage("Your passwords do not match.", "error");

        return;
    }

    if (password.length < 8 || password.length > 72) {

        showMessage(
            "Password must contain between 8 and 72 characters.",
            "error"
        );

        return;
    }

    registerButton.disabled = true;
    registerButton.textContent = "Creating account...";

    try {

        const response = await fetch(`${API_URL}/register`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                fullName,
                email,
                password
            })

        });

        const data = await response.json();

        if (!response.ok) {

            showMessage(data.message || "Registration failed.", "error");

            return;
        }

        // Registration succeeded.
        // Switch to login instead of automatically logging in.

        registerForm.reset();

        document.getElementById("loginEmail").value = email;

        showLoginForm();

        showMessage(
            "Account created successfully! You can now sign in.",
            "success"
        );

    } catch (error) {

        console.error("Registration error:", error);

        showMessage(
            "Cannot connect to the server. Please try again.",
            "error"
        );

    } finally {

        registerButton.disabled = false;
        registerButton.textContent = "Create Resident Account";

    }

});


// ======================================
// CHECK EXISTING SESSION
// ======================================

async function checkExistingSession() {

    try {

        const response = await fetch(`${API_URL}/me`, {

            method: "GET",

            credentials: "include"

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


// Run session check when the page opens
checkExistingSession();