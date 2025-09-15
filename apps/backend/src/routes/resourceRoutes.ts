import { Router } from "express";
import {
    shareResource,
    getResourcesForStudent,
    getResourcesForProfessor,
    updateResource,
    deleteResource,
    trackResourceDownload,
    getResourceStats,
} from "../controllers/resourceController";

const router: Router = Router();

// Resource sharing (Professor)
router.post("/share", shareResource);
router.get("/professor/:professorId", getResourcesForProfessor);
router.get("/professor/:professorId/stats", getResourceStats);

// Resource viewing (Student)
router.get("/student/:studentId", getResourcesForStudent);

// Resource management
router.put("/:resourceId", updateResource);
router.delete("/:resourceId", deleteResource);
router.post("/:resourceId/download", trackResourceDownload);

export default router;
