import { Router } from "express";
import universityRoutes from "./universityRoutes";
import courseRoutes from "./courseRoutes";
import hostelRoutes from "./hostelRoutes";
import userRoutes from "./userRoutes";
import applicationRoutes from "./applicationRoutes";
import semesterRouters from "./semesterRoutes";

const router: Router = Router();

// API routes
router.use("/universities", universityRoutes);
router.use("/courses", courseRoutes);
router.use("/hostels", hostelRoutes);
router.use("/users", userRoutes);
router.use("/applications", applicationRoutes);
router.use("/semesters", semesterRouters);

//TODO: create below routes and its specific function
//notice
//exam
//subjects

// Health check
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "ERP API is running",
        timestamp: new Date().toISOString(),
    });
});

export default router;
