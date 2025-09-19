import multer from "multer";
import { Request, Response, NextFunction, RequestHandler } from "express";

// Define allowed file types for documents
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Define maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    // Check if file type is allowed
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`
            )
        );
    }
};

// Create multer instance
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1, // Allow only one file per upload
    },
});

// Middleware for single file upload
export const uploadSingle: RequestHandler = upload.single("document");

// Middleware for receipt upload
export const uploadReceiptFile: RequestHandler = upload.single("receipt");

// Middleware for payment attachment upload (frontend uses field name 'attachment')
export const uploadAttachmentFile: RequestHandler = upload.single("attachment");

// Middleware for multiple files upload (if needed)
export const uploadMultiple: RequestHandler = upload.array("documents", 10); // Max 10 files

// Error handler for multer errors
export const handleMulterError = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File size too large. Maximum size allowed is 5MB.",
                error: "File Size Limit Exceeded",
            });
        }
        if (error.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Too many files. Maximum 1 file allowed per upload.",
                error: "File Count Limit Exceeded",
            });
        }
        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                message:
                    'Unexpected field name. Use "document" for general uploads or "receipt" for payment receipts.',
                error: "Unexpected Field",
            });
        }
    }

    if (error.message.includes("File type")) {
        return res.status(400).json({
            success: false,
            message: error.message,
            error: "Invalid File Type",
        });
    }

    // Other multer errors
    return res.status(400).json({
        success: false,
        message: "File upload error",
        error: error.message,
    });
};
