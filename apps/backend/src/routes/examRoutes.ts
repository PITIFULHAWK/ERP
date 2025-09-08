import { Router } from "express";
import { body, param } from "express-validator";
import {
    getExams,
    getExamById,
    createExam,
    updateExam,
    deleteExam,
    createExamResult,
    getExamResults,
} from "../controllers/examController";
import {
    requireAuth,
    requireStaff,
    requireAdmin,
} from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/requestValidatorMiddlwware";

const router: Router = Router();

// Public route - authenticated users can see the list of exams
router.get("/", requireAuth, getExams);

// Staff-only route - authenticated staff can view a specific exam
router.get(
    "/:id",
    requireAuth,
    requireStaff,
    [param("id").isUUID().withMessage("Valid exam ID is required")],
    validateRequest,
    getExamById
);

// Admin-only routes - only admins can create, update, or delete exams
router.post(
    "/",
    requireAuth,
    requireAdmin,
    [
        body("name")
            .isLength({ min: 1, max: 255 })
            .withMessage("Exam name must be between 1 and 255 characters"),
        body("type")
            .isIn(["MID_TERM", "FINAL_EXAM", "QUIZ", "PRACTICAL"])
            .withMessage("Invalid exam type"),
        body("examDate").isISO8601().withMessage("Valid exam date is required"),
        body("maxMarks")
            .isNumeric()
            .isFloat({ min: 0 })
            .withMessage("Max marks must be a positive number"),
        body("semesterId")
            .isUUID()
            .withMessage("Valid semester ID is required"),
    ],
    validateRequest,
    createExam
);

router.put(
    "/:id",
    requireAuth,
    requireAdmin,
    [
        param("id").isUUID().withMessage("Valid exam ID is required"),
        body("name")
            .optional()
            .isLength({ min: 1, max: 255 })
            .withMessage("Exam name must be between 1 and 255 characters"),
        body("type")
            .optional()
            .isIn(["MID_TERM", "FINAL_EXAM", "QUIZ", "PRACTICAL"])
            .withMessage("Invalid exam type"),
        body("examDate")
            .optional()
            .isISO8601()
            .withMessage("Valid exam date is required"),
        body("maxMarks")
            .optional()
            .isNumeric()
            .isFloat({ min: 0 })
            .withMessage("Max marks must be a positive number"),
    ],
    validateRequest,
    updateExam
);

router.delete(
    "/:id",
    requireAuth,
    requireAdmin,
    [param("id").isUUID().withMessage("Valid exam ID is required")],
    validateRequest,
    deleteExam
);

// Exam result routes
router.post(
    "/:examId/results",
    requireAuth,
    requireStaff,
    [
        param("examId").isUUID().withMessage("Valid exam ID is required"),
        body("studentId").isUUID().withMessage("Valid student ID is required"),
        body("totalMarksObtained")
            .optional()
            .isNumeric()
            .isFloat({ min: 0 })
            .withMessage("Total marks obtained must be a positive number"),
        body("percentage")
            .optional()
            .isNumeric()
            .isFloat({ min: 0, max: 100 })
            .withMessage("Percentage must be between 0 and 100"),
        body("status")
            .isIn(["PASS", "FAIL", "PENDING", "WITHHELD"])
            .withMessage("Invalid result status"),
        body("remarks")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Remarks must be at most 500 characters"),
        body("grade")
            .optional()
            .isNumeric()
            .isFloat({ min: 0 })
            .withMessage("Grade must be a positive number"),
    ],
    validateRequest,
    createExamResult
);

router.get(
    "/:examId/results",
    requireAuth,
    requireStaff,
    [param("examId").isUUID().withMessage("Valid exam ID is required")],
    validateRequest,
    getExamResults
);

export default router;
