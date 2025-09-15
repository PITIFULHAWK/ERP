import { Router } from "express";
import {
    markAttendance,
    getStudentAttendance,
    getSectionAttendance,
    getSectionAttendanceStats,
} from "../controllers/attendanceController";

const router: Router = Router();

// Attendance marking (Professor)
router.post("/mark", markAttendance);

// Attendance viewing
router.get("/student/:studentId", getStudentAttendance);
router.get("/section/:sectionId", getSectionAttendance);
router.get("/section/:sectionId/stats", getSectionAttendanceStats);

export default router;
