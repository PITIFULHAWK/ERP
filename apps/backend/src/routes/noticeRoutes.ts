import { Router } from "express";
import { body, param } from "express-validator";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware";
import {
    getAllNotices,
    getNoticeById,
    createNotice,
    updateNotice,
    deleteNotice,
} from "../controllers/noticeController";

const router: Router = Router();

// GET /api/v1/notices - Get all notices (public)
router.get("/", getAllNotices);

// GET /api/v1/notices/:id - Get notice by ID (public)
router.get(
    "/:id",
    [param("id").isUUID().withMessage("Invalid notice ID format")],
    getNoticeById
);

// POST /api/v1/notices - Create new notice (Admin only)
router.post(
    "/",

    requireAuth,
    requireAdmin,
    [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("Title is required")
            .isLength({ min: 3, max: 200 })
            .withMessage("Title must be between 3 and 200 characters"),
        body("content")
            .trim()
            .notEmpty()
            .withMessage("Content is required")
            .isLength({ min: 10 })
            .withMessage("Content must be at least 10 characters"),
        body("universityId")
            .isUUID()
            .withMessage("Valid university ID is required"),
        body("type").optional().isIn(["GENERAL","URGENT","ACADEMIC","HOSTEL","EXAM"]).withMessage("Invalid notice type"),
        body("priority").optional().isIn(["LOW","MEDIUM","HIGH"]).withMessage("Invalid priority"),
        body("targetAudience").optional().isIn(["ALL","STUDENTS","FACULTY","STAFF"]).withMessage("Invalid target audience"),
    ],
    createNotice
);

// PUT /api/v1/notices/:id - Update notice (Admin only)
router.put(
    "/:id",
    requireAuth,
    requireAdmin,
    [
        param("id").isUUID().withMessage("Invalid notice ID format"),
        body("title")
            .optional()
            .trim()
            .isLength({ min: 3, max: 200 })
            .withMessage("Title must be between 3 and 200 characters"),
        body("content")
            .optional()
            .trim()
            .isLength({ min: 10 })
            .withMessage("Content must be at least 10 characters"),
        body("type").optional().isIn(["GENERAL","URGENT","ACADEMIC","HOSTEL","EXAM"]).withMessage("Invalid notice type"),
        body("priority").optional().isIn(["LOW","MEDIUM","HIGH"]).withMessage("Invalid priority"),
        body("targetAudience").optional().isIn(["ALL","STUDENTS","FACULTY","STAFF"]).withMessage("Invalid target audience"),
    ],
    updateNotice
);

// DELETE /api/v1/notices/:id - Delete notice (Admin only)
router.delete(
    "/:id",
    requireAuth,
    requireAdmin,
    [param("id").isUUID().withMessage("Invalid notice ID format")],
    deleteNotice
);

export default router;
