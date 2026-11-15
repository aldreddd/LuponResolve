// ======================================
// AUTHENTICATION MIDDLEWARE
// ======================================

// Check whether the user is logged in
function requireAuth(req, res, next) {

    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please log in."
        });
    }

    // User is authenticated.
    // Continue to the next middleware or route.
    next();
}


// ======================================
// ROLE AUTHORIZATION MIDDLEWARE
// ======================================

// Check whether the user has permission
function requireRole(...allowedRoles) {

    return (req, res, next) => {

        // Make sure the user is logged in first
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const userRole = req.session.user.role;

        // Check whether the user's role is allowed
        if (!allowedRoles.includes(userRole) && userRole !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. You do not have permission."
            });
        }

        // Permission granted
        next();
    };
}


// Export middleware functions
module.exports = {
    requireAuth,
    requireRole
};