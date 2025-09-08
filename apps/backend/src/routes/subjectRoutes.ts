import { Router } from "express";
import { body, param } from "express-validator";
import {
    getSubjects,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubjectsBySemester,
    createGrade,
} from "../controllers/subjectController";
import {
    requireAuth,
    requireStaff,
    requireAdmin,
} from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/requestValidatorMiddlwware";

const router: Router = Router();

// Public route - authenticated users can see the list of subjects
router.get("/", requireAuth, getSubjects);

// Staff-only route - authenticated staff can view a specific subject
router.get(
    "/:id",
    requireAuth,
    requireStaff,
    [param("id").isUUID().withMessage("Valid subject ID is required")],
    validateRequest,
    getSubjectById
);

// Get subjects by semester
router.get(
    "/semester/:semesterId",
    requireAuth,
    [param("semesterId").isUUID().withMessage("Valid semester ID is required")],
    validateRequest,
    getSubjectsBySemester
);

// Admin-only routes - only admins can create, update, or delete subjects
router.post(
    "/",
    requireAuth,
    requireAdmin,
    [
        body("name")
            .isLength({ min: 1, max: 255 })
            .withMessage("Subject name must be between 1 and 255 characters"),
        body("code")
            .isLength({ min: 1, max: 50 })
            .withMessage("Subject code must be between 1 and 50 characters"),
        body("credits")
            .isInt({ min: 0, max: 10 })
            .withMessage("Credits must be an integer between 0 and 10"),
        body("semesterId")
            .isUUID()
            .withMessage("Valid semester ID is required"),
    ],
    validateRequest,
    createSubject
);

router.put(
    "/:id",
    requireAuth,
    requireAdmin,
    [
        param("id").isUUID().withMessage("Valid subject ID is required"),
        body("name")
            .optional()
            .isLength({ min: 1, max: 255 })
            .withMessage("Subject name must be between 1 and 255 characters"),
        body("code")
            .optional()
            .isLength({ min: 1, max: 50 })
            .withMessage("Subject code must be between 1 and 50 characters"),
        body("credits")
            .optional()
            .isInt({ min: 0, max: 10 })
            .withMessage("Credits must be an integer between 0 and 10"),
    ],
    validateRequest,
    updateSubject
);

router.delete(
    "/:id",
    requireAuth,
    requireAdmin,
    [param("id").isUUID().withMessage("Valid subject ID is required")],
    validateRequest,
    deleteSubject
);

// Grade routes
router.post(
    "/:subjectId/grades",
    requireAuth,
    requireStaff,
    [
        param("subjectId").isUUID().withMessage("Valid subject ID is required"),
        body("examResultId")
            .isUUID()
            .withMessage("Valid exam result ID is required"),
        body("marksObtained")
            .isNumeric()
            .isFloat({ min: 0 })
            .withMessage("Marks obtained must be a positive number"),
    ],
    validateRequest,
    createGrade
);

export default router;
