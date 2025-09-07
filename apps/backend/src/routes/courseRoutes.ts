import { Router } from "express";
import { body, param } from "express-validator";
import {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollStudentInCourse,
} from "../controllers/courseController";
import { requireAuth, requireStaff } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/requestValidatorMiddlwware";

const router: Router = Router();

// Public route - anyone can see the list of courses
router.get("/", getCourses);

// Staff-only route - authenticated staff can view a specific course
router.get(
    "/:id",
    requireAuth,
    requireStaff,
    [param("id").isUUID().withMessage("Valid course ID is required")],
    validateRequest,
    getCourseById
);

// Admin-only routes - only admins can create, update, or delete courses
router.post(
    "/",
    requireAuth,
    requireStaff,
    [
        body("name")
            .isString()
            .notEmpty()
            .withMessage("Course name is required"),
        body("credits")
            .isInt({ min: 1 })
            .withMessage("Credits must be a positive integer"),
        body("totalSemester")
            .isInt({ min: 1 })
            .withMessage("Total semesters must be a positive integer"),
        body("totalFees")
            .isFloat({ gt: 0 })
            .withMessage("Fees must be a positive number"),
        body("universityId")
            .isUUID()
            .withMessage("A valid university ID is required"),
    ],
    validateRequest,
    createCourse
);

router.patch(
    "/:id",
    requireAuth,
    requireStaff,
    [
        param("id").isUUID().withMessage("Valid course ID is required"),
        body("name").optional().isString().notEmpty(),
        body("credits").optional().isInt({ min: 1 }),
        body("totalSemester").optional().isInt({ min: 1 }),
        body("totalFees").optional().isFloat({ gt: 0 }),
    ],
    validateRequest,
    updateCourse
);

// New route for enrolling a student in a course
router.patch(
    "/:courseId/enroll-student/:userId",
    requireAuth,
    requireStaff, // Only staff can enroll students
    [
        param("courseId").isUUID().withMessage("Valid course ID is required"),
        param("userId").isUUID().withMessage("Valid user ID is required"),
    ],
    validateRequest,
    enrollStudentInCourse
);

router.delete(
    "/:id",
    requireAuth,
    requireStaff,
    [param("id").isUUID().withMessage("Valid course ID is required")],
    validateRequest,
    deleteCourse
);

export default router;
