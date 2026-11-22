
const { createClient } = require("@supabase/supabase-js");

// ======================================
// SUPABASE STORAGE CONFIGURATION
// ======================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET;

// ======================================
// VALIDATE ENVIRONMENT VARIABLES
// ======================================

if (!supabaseUrl || !supabaseSecretKey || !supabaseBucket) {
    throw new Error(
        "Missing Supabase configuration. Check backend/.env"
    );
}

// ======================================
// CREATE SUPABASE CLIENT
// ======================================

const supabase = createClient(
    supabaseUrl,
    supabaseSecretKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        }
    }
);

// ======================================
// EXPORT CONFIGURATION
// ======================================

module.exports = {
    supabase,
    supabaseBucket
};
