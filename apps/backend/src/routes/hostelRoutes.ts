import { Router } from "express";
import {
  getHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
} from "../controllers/hostelController";
// import { requireAdmin } from "../middleware";

const router : Router= Router();

// Public routes
router.get("/", getHostels);
router.get("/:id", getHostelById);

// Admin only routes
router.post("/", createHostel);
router.put("/:id", updateHostel);
router.delete("/:id", deleteHostel);

export default router;
