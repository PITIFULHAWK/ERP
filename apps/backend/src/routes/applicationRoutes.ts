import { Router } from "express";
import {
    getApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    verifyApplication,
    addDocument,
    verifyDocument,
    deleteApplication,
} from "../controllers/applicationController";

const router: Router = Router();

// Application routes
router.get("/", getApplications);
router.get("/:id", getApplicationById);
router.post("/", createApplication);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

// Verification routes
router.patch("/:id/verify", verifyApplication);

// Document routes
router.post("/documents", addDocument);
router.patch("/documents/:id/verify", verifyDocument);

export default router;
