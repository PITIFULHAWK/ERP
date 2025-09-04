import { Router } from "express";
import {
  getUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} from "../controllers/universityController";
import { requireAdmin } from "../middleware";

const router : Router = Router();

// Public routes
router.get("/", getUniversities);
router.get("/:id", getUniversityById);

// Admin only routes
router.post("/", requireAdmin, createUniversity);
router.put("/:id", requireAdmin, updateUniversity);
router.delete("/:id", requireAdmin, deleteUniversity);

export default router;
