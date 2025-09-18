import { Router } from "express";
import {
    // Professor resource management
    shareResource,
    getResourcesForStudent,
    getResourcesForProfessor,
    updateResource,
    deleteResource,
    trackResourceDownload,
    getResourceStats,
    upload, // Add the multer middleware
} from "../controllers/resourceController";

const router: Router = Router();

// ===============================
// PROFESSOR RESOURCE MANAGEMENT
// ===============================
// Resource sharing (Professor) - supports both file upload and external URLs
router.post("/share", upload.single("file"), shareResource);
router.get("/professor/:professorId", getResourcesForProfessor);
router.get("/professor/:professorId/stats", getResourceStats);

// Resource viewing (Student)
router.get("/student/:studentId", getResourcesForStudent);

// Resource management (Professor)
router.patch("/:resourceId", updateResource); // Changed PUT to PATCH
router.delete("/:resourceId", deleteResource);
router.post("/:resourceId/download", trackResourceDownload);

export default router;
