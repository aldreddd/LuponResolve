
require("dotenv").config({
    path: require("path").join(__dirname, "../../.env")
});

const {
    supabase,
    supabaseBucket
} = require("../../config/supabase");

async function testSupabase() {
    try {
        console.log("Checking Supabase connection...");

        const { data, error } =
            await supabase.storage.listBuckets();

        if (error) {
            throw error;
        }

        console.log("\nSupabase connection successful!");

        console.log("\nActual buckets returned by Supabase:");
        console.log(JSON.stringify(
            data.map(bucket => ({
                name: bucket.name,
                id: bucket.id,
                public: bucket.public
            })),
            null,
            2
        ));

        console.log("\nBucket configured in backend:");
        console.log(JSON.stringify(supabaseBucket));

        const bucketExists = data.some(
            bucket => bucket.name === supabaseBucket
        );

        if (!bucketExists) {
            console.log("\nConfigured bucket was not found.");
            return;
        }

        console.log("\nEvidence bucket is accessible!");

    } catch (error) {
        console.error("\nSupabase connection failed:");
        console.error(error.message);
    }
}

testSupabase();
