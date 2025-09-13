import { Router } from "express";
import {
    getPlacements,
    getPlacementById,
    createPlacement,
    updatePlacement,
    deletePlacement,
    getEligibleUsersCount,
    sendPlacementNotification,
    getPlacementStats,
} from "../controllers/placementController";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router: Router = Router();

// Admin placement management routes
router.get("/", requireAuth, getPlacements); // Get all placements with filtering
router.get("/stats", requireAuth, getPlacementStats); // Get placement statistics
router.get("/:id", requireAuth, getPlacementById); // Get placement by ID
router.post("/", requireAuth, requireAdmin, createPlacement); // Create new placement (Admin only)
router.put("/:id", requireAuth, requireAdmin, updatePlacement); // Update placement (Admin only)
router.delete("/:id", requireAuth, requireAdmin, deletePlacement); // Delete placement (Admin only)

// Email notification routes
router.get("/:id/eligible-count", requireAuth, getEligibleUsersCount); // Get count of eligible users
router.post(
    "/:id/notify",
    requireAuth,
    requireAdmin,
    sendPlacementNotification
); // Send emails to eligible users (Admin only)

export default router;
