// Import packages
const caseRoutes = require("./routes/caseRoutes");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const SQLiteSessionStore = require("./config/sqliteSessionStore");

// Import authentication routes
const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");
const db = require("./config/database");

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Set the server port
const PORT = process.env.PORT || 3000;


// ======================================
// MIDDLEWARE
// ======================================

// Allow frontend to communicate with backend
app.use(cors({
    origin: process.env.CLIENT_URL || "http://127.0.0.1:5500",
    credentials: true
}));

// Allow Express to read JSON request bodies
app.use(express.json());

// Allow Express to read form data
app.use(express.urlencoded({ extended: true }));

// Session configuration using the existing SQLite database
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // Use true when deployed with HTTPS
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
}));


// ======================================
// ROUTES
// ======================================

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "LuponResolve Backend is running!",
        status: "Online"
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/cases", caseRoutes);


// ======================================
// START SERVER
// ======================================

app.listen(PORT, () => {
    console.log(`LuponResolve server running at http://localhost:${PORT}`);
});