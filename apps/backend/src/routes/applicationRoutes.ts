import { Router } from "express";
import {
    getApplications,
    getAllDocuments,
    getApplicationById,
    createApplication,
    updateApplication,
    verifyApplication,
    addDocument,
    verifyDocument,
    deleteApplication,
    deleteDocument,
    checkApplicationExists,
} from "../controllers/applicationController";
import { uploadSingle, handleMulterError } from "../middleware/upload";
import { requireAuth, requireStaff } from "../middleware/authMiddleware";

const router: Router = Router();

// Application routes
router.get("/", requireAuth, getApplications);
router.get("/check", requireAuth, checkApplicationExists); // Check if user has an application
router.get("/:id", requireAuth, getApplicationById);
router.post("/", requireAuth, createApplication);
router.put("/:id", requireAuth, updateApplication);
router.delete("/:id", requireAuth, deleteApplication);

// Verification routes (staff only)
router.patch("/:id/verify", requireAuth, requireStaff, verifyApplication);

// Document routes
router.get("/documents", requireAuth, requireStaff, getAllDocuments); // Get all documents with application details
router.post(
    "/documents",
    requireAuth,
    uploadSingle,
    handleMulterError,
    addDocument
); // Upload document with file
router.patch(
    "/documents/:id/verify",
    requireAuth,
    requireStaff,
    verifyDocument
);
router.delete("/documents/:id", requireAuth, deleteDocument); // Delete document

export default router;
