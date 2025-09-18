import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";
import {
    getSectionTimetable,
    uploadTimetable,
    deleteTimetable,
    getAllSectionTimetables,
    getAcademicYears,
    upload,
} from "../controllers/timetableController";

const router: Router = Router();

// Protect all routes with authentication
router.use(requireAuth);

// Get all academic years for dropdown
router.get("/academic-years", getAcademicYears);

// Get all section timetables (admin only)
router.get("/", requireAdmin, getAllSectionTimetables);

// Get timetable for specific section
router.get("/:sectionId", getSectionTimetable);

// Upload/update timetable for specific section (admin only)
router.post(
    "/:sectionId",
    requireAdmin,
    upload.single("timetable"),
    uploadTimetable
);
router.put(
    "/:sectionId",
    requireAdmin,
    upload.single("timetable"),
    uploadTimetable
);

// Delete timetable for specific section (admin only)
router.delete("/:sectionId", requireAdmin, deleteTimetable);

export default router;
