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

const router: Router = Router();

// Application routes
router.get("/", getApplications);
router.get("/:id", getApplicationById);
router.get("/:id/check", checkApplicationExists); // Debug endpoint to check if application exists
router.post("/", createApplication);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

// Verification routes
router.patch("/:id/verify", verifyApplication);

// Document routes
router.get("/documents", getAllDocuments); // Get all documents with application details
router.post("/documents", uploadSingle, handleMulterError, addDocument); // Upload document with file
router.patch("/documents/:id/verify", verifyDocument);
router.delete("/documents/:id", deleteDocument); // Delete document

export default router;
