import { Router } from "express";
import universityRoutes from "./universityRoutes";
import courseRoutes from "./courseRoutes";
import hostelRoutes from "./hostelRoutes";
import userRoutes from "./userRoutes";
import applicationRoutes from "./applicationRoutes";
import semesterRouters from "./semesterRoutes";
import noticeRoutes from "./noticeRoutes";
import examRoutes from "./examRoutes";
import subjectRoutes from "./subjectRoutes";
import paymentRoutes from "./paymentRoutes";
import placementRoutes from "./placementRoutes";
import sectionRoutes from "./sectionRoutes";
import attendanceRoutes from "./attendanceRoutes";
import academicCalendarRoutes from "./academicCalendarRoutes";
import academicYearRoutes from "./academicYearRoutes";
import resourceRoutes from "./resourceRoutes";
import complaintRoutes from "./complaintRoutes";

const router: Router = Router();

// API routes
router.use("/universities", universityRoutes);
router.use("/courses", courseRoutes);
router.use("/hostels", hostelRoutes);
router.use("/users", userRoutes);
router.use("/applications", applicationRoutes);
router.use("/semesters", semesterRouters);
router.use("/notice", noticeRoutes);
router.use("/exams", examRoutes);
router.use("/subjects", subjectRoutes);
router.use("/payments", paymentRoutes);
router.use("/placements", placementRoutes);

// New academic management routes
router.use("/sections", sectionRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/academic-calendar", academicCalendarRoutes);
router.use("/academic-years", academicYearRoutes);
router.use("/resources", resourceRoutes);

// Complaint management
router.use("/complaints", complaintRoutes);

// Health check
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "ERP API is running",
        timestamp: new Date().toISOString(),
    });
});

export default router;
