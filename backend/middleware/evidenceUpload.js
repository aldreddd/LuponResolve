
const multer = require("multer");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 5;

const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "application/pdf"
]);

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES,
        fields: 30,
        parts: 35
    },

    fileFilter: (req, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            return callback(
                new Error(
                    "Only JPG, PNG, and PDF files are allowed."
                )
            );
        }

        callback(null, true);
    }
});

// Accept up to five files from the "evidence" field.
const uploadEvidence = upload.array("evidence", MAX_FILES);

// Verify actual file contents, not just browser-provided MIME types.
async function validateEvidenceFiles(files) {
    const { fileTypeFromBuffer } = await import("file-type");

    for (const file of files || []) {
        const detectedType = await fileTypeFromBuffer(file.buffer);

        if (
            !detectedType ||
            !allowedMimeTypes.has(detectedType.mime) ||
            detectedType.mime !== file.mimetype
        ) {
            throw new Error(
                `The file "${file.originalname}" is not a valid JPG, PNG, or PDF.`
            );
        }
    }

    return true;
}

module.exports = {
    uploadEvidence,
    validateEvidenceFiles,
    MAX_FILE_SIZE,
    MAX_FILES
};
