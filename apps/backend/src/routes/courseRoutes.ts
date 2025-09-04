import { Router } from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController";
import { requireAdmin } from "../middleware";

const router : Router = Router();

// Public routes
router.get("/", getCourses);
router.get("/:id", getCourseById);

// Admin only routes
router.post("/", requireAdmin, createCourse);
router.put("/:id", requireAdmin, updateCourse);
router.delete("/:id", requireAdmin, deleteCourse);

export default router;
