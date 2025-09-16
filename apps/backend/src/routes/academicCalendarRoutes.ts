import { Router } from "express";
import {
    uploadCalendarPDF,
    getCalendarPDF,
    getStudentCalendar,
    removeCalendarPDF,
    getAcademicYearsWithCalendar,
    uploadCalendar, // Add multer middleware
} from "../controllers/academicCalendarController";

const router: Router = Router();

// Academic calendar PDF management
router.post("/upload", uploadCalendar.single("file"), uploadCalendarPDF);
router.get("/:academicYearId", getCalendarPDF);
router.delete("/:academicYearId", removeCalendarPDF);

// Academic years with calendar status
router.get("/", getAcademicYearsWithCalendar);

// Student calendar view
router.get("/student/:studentId", getStudentCalendar);

export default router;
