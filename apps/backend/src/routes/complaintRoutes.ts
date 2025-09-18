import { Router } from "express";
import { body, param, query } from "express-validator";
import {
    createComplaint,
    getComplaints,
    getComplaintById,
    updateComplaintStatus,
    addComplaintUpdate,
    getComplaintStats,
    deleteComplaint,
} from "../controllers/complaintController";
import { requireAuth, requireStaff } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/requestValidatorMiddlwware";

const router: Router = Router();

// Create a new complaint (Students only)
router.post(
    "/",
    requireAuth,
    [
        body("title")
            .isLength({ min: 5, max: 200 })
            .withMessage("Title must be between 5 and 200 characters"),
        body("description")
            .isLength({ min: 10, max: 2000 })
            .withMessage("Description must be between 10 and 2000 characters"),
        body("category")
            .isIn([
                "HOSTEL",
                "ACADEMIC",
                "INFRASTRUCTURE",
                "FOOD",
                "TRANSPORT",
                "LIBRARY",
                "MEDICAL",
                "FINANCIAL",
                "ADMINISTRATIVE",
                "DISCIPLINARY",
                "TECHNICAL",
                "OTHER",
            ])
            .withMessage("Valid category is required"),
        body("priority")
            .optional()
            .isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
            .withMessage("Priority must be LOW, MEDIUM, HIGH, or CRITICAL"),
        body("location")
            .optional()
            .isLength({ max: 200 })
            .withMessage("Location must be less than 200 characters"),
        body("urgency")
            .optional()
            .isBoolean()
            .withMessage("Urgency must be a boolean"),
        body("attachmentUrls")
            .optional()
            .isArray()
            .withMessage("Attachment URLs must be an array"),
    ],
    validateRequest,
    createComplaint
);

// Get all complaints (with filtering and pagination)
router.get(
    "/",
    requireAuth,
    [
        query("status")
            .optional()
            .isIn(["OPEN", "IN_PROGRESS", "PENDING_INFO", "RESOLVED", "CLOSED", "ESCALATED"])
            .withMessage("Invalid status filter"),
        query("category")
            .optional()
            .isIn([
                "HOSTEL",
                "ACADEMIC",
                "INFRASTRUCTURE",
                "FOOD",
                "TRANSPORT",
                "LIBRARY",
                "MEDICAL",
                "FINANCIAL",
                "ADMINISTRATIVE",
                "DISCIPLINARY",
                "TECHNICAL",
                "OTHER",
            ])
            .withMessage("Invalid category filter"),
        query("priority")
            .optional()
            .isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
            .withMessage("Invalid priority filter"),
        query("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Page must be a positive integer"),
        query("limit")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("Limit must be between 1 and 100"),
        query("sortBy")
            .optional()
            .isIn(["createdAt", "updatedAt", "priority", "status"])
            .withMessage("Invalid sort field"),
        query("sortOrder")
            .optional()
            .isIn(["asc", "desc"])
            .withMessage("Sort order must be asc or desc"),
    ],
    validateRequest,
    getComplaints
);

// Get complaint statistics (Admin only)
router.get(
    "/stats",
    requireAuth,
    requireStaff,
    getComplaintStats
);

// Get complaint by ID
router.get(
    "/:id",
    requireAuth,
    [param("id").isUUID().withMessage("Valid complaint ID is required")],
    validateRequest,
    getComplaintById
);

// Update complaint status (Admin/Staff only)
router.patch(
    "/:id/status",
    requireAuth,
    requireStaff,
    [
        param("id").isUUID().withMessage("Valid complaint ID is required"),
        body("status")
            .isIn(["OPEN", "IN_PROGRESS", "PENDING_INFO", "RESOLVED", "CLOSED", "ESCALATED"])
            .withMessage("Valid status is required"),
        body("resolutionNote")
            .optional()
            .isLength({ max: 1000 })
            .withMessage("Resolution note must be less than 1000 characters"),
        body("assignedTo")
            .optional()
            .isUUID()
            .withMessage("Assigned admin must be a valid user ID"),
    ],
    validateRequest,
    updateComplaintStatus
);

// Add comment/update to complaint
router.post(
    "/:id/updates",
    requireAuth,
    [
        param("id").isUUID().withMessage("Valid complaint ID is required"),
        body("message")
            .isLength({ min: 1, max: 1000 })
            .withMessage("Message must be between 1 and 1000 characters"),
        body("isInternal")
            .optional()
            .isBoolean()
            .withMessage("isInternal must be a boolean"),
    ],
    validateRequest,
    addComplaintUpdate
);

// Delete complaint (Admin only - soft delete)
router.delete(
    "/:id",
    requireAuth,
    requireStaff,
    [param("id").isUUID().withMessage("Valid complaint ID is required")],
    validateRequest,
    deleteComplaint
);

export default router;