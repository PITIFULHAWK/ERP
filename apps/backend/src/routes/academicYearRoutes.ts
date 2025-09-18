import { Router } from "express";
import {
    getAcademicYears,
    getAcademicYear,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    setActiveAcademicYear,
    getActiveAcademicYear,
} from "../controllers/academicYearController";

const router: Router = Router();

// Academic year management routes
router.get("/", getAcademicYears);
router.post("/", createAcademicYear);
router.get("/active/:universityId", getActiveAcademicYear);
router.get("/:id", getAcademicYear);
router.put("/:id", updateAcademicYear);
router.delete("/:id", deleteAcademicYear);
router.patch("/:id/activate", setActiveAcademicYear);

export default router;
