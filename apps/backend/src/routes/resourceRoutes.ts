import { Router } from "express";
import {
    // Admin resource management
    getResources,
    getResource,
    createResource,
    updateResourceAdmin,
    deleteResourceAdmin,
    getResourceStatsAdmin,
    uploadResourceFile,
    downloadResourceAdmin,
    upload, // Add the multer middleware

    // Professor resource management
    shareResource,
    getResourcesForStudent,
    getResourcesForProfessor,
    updateResource,
    deleteResource,
    trackResourceDownload,
    getResourceStats,
} from "../controllers/resourceController";

const router: Router = Router();

// ===============================
// ADMIN RESOURCE MANAGEMENT (for testing)
// ===============================
router.get("/", getResources); // GET /resources
router.get("/stats", getResourceStatsAdmin); // GET /resources/stats
router.get("/:id", getResource); // GET /resources/:id
router.post("/", createResource); // POST /resources
router.post("/:id/upload", upload.single("file"), uploadResourceFile); // POST /resources/:id/upload
router.patch("/:id", updateResourceAdmin); // PATCH /resources/:id
router.delete("/:id", deleteResourceAdmin); // DELETE /resources/:id
router.get("/:id/download", downloadResourceAdmin); // GET /resources/:id/download

// ===============================
// PROFESSOR RESOURCE MANAGEMENT (existing)
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
