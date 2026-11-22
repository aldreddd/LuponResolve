
// ======================================
// LOAD ENVIRONMENT VARIABLES
// ======================================

const dotenv = require("dotenv");
dotenv.config();


// ======================================
// IMPORT PACKAGES AND ROUTES
// ======================================

const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);

const pool = require("./config/postgres");

const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");
const caseRoutes = require("./routes/caseRoutes");
const hearingRoutes = require("./routes/hearingRoutes");
const gmailRoutes = require("./routes/gmailRoutes");
const adminRoutes = require("./routes/adminRoutes");


// ======================================
// CREATE EXPRESS APPLICATION
// ======================================

const app = express();

const PORT = process.env.PORT || 3000;

// Project root: LuponResolve/
const PROJECT_ROOT = path.join(__dirname, "..");

const IS_PRODUCTION = process.env.NODE_ENV === "production";


// ======================================
// PROXY CONFIGURATION
// ======================================

// Render uses a reverse proxy.
// Trust the proxy when deployed so secure cookies work correctly.

if (IS_PRODUCTION) {
    app.set("trust proxy", 1);
}


// ======================================
// MIDDLEWARE
// ======================================

// CORS is needed for local development because
// Live Server and Express use different ports.

if (!IS_PRODUCTION) {
    app.use(cors({
        origin: process.env.CLIENT_URL || "http://127.0.0.1:5500",
        credentials: true
    }));
}

// Allow Express to read JSON request bodies.
app.use(express.json());

// Allow Express to read form data.
app.use(express.urlencoded({ extended: true }));


// ======================================
// SESSION CONFIGURATION
// ======================================

app.use(session({
    store: new PgSession({
        pool: pool,
        tableName: "sessions",
        createTableIfMissing: true
    }),

    secret: process.env.SESSION_SECRET,

    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 2
    }
}));


// ======================================
// API ROUTES
// ======================================

// Backend health check.
app.get("/api", (req, res) => {
    res.json({
        message: "LuponResolve Backend is running!",
        status: "Online"
    });
});

// Authentication routes.
app.use("/api/auth", authRoutes);

// Role routes.
app.use("/api/roles", roleRoutes);

// Case routes.
app.use("/api/cases", caseRoutes);

// Hearing management routes.
app.use("/api/hearings", hearingRoutes);

app.use("/api/gmail", gmailRoutes);

// Administrator dashboard routes.
app.use("/api/admin", adminRoutes);


// ======================================
// FRONTEND STATIC ASSETS
// ======================================

// Serve only the frontend CSS and JavaScript folders.
// Do not expose the entire project root or backend folder.

app.use(
    "/css",
    express.static(path.join(PROJECT_ROOT, "css"))
);

app.use(
    "/js",
    express.static(path.join(PROJECT_ROOT, "js"))
);


// ======================================
// FRONTEND HTML PAGES
// ======================================

// Main landing page.
app.get("/", (req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, "index.html"));
});
 // Also serve the homepage through /index.html.
app.get("/index.html", (req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, "index.html"));
});

// Public guest complaint form.
app.get("/guest-complaint.html", (req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, "guest-complaint.html"));
});

// Public case tracking page.
app.get("/track-case.html", (req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, "track-case.html"));
});

// Authentication page.
app.get("/auth.html", (req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, "auth.html"));
});

// Resident portal.
app.get("/resident.html", (req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, "resident.html"));
});

// Secretary portal.
app.get("/secretary.html", (req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, "secretary.html"));
});

// Lupon portal.
app.get("/lupon.html", (req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, "lupon.html"));
});

// Case workflow page.
app.get("/workflow.html", (req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, "workflow.html"));
});
app.get("/admin.html", (req, res) => {
    res.sendFile(path.join(PROJECT_ROOT, "admin.html"));
});


// ======================================
// START SERVER
// ======================================

app.listen(PORT, () => {
    console.log(`LuponResolve server running on port ${PORT}`);
});
