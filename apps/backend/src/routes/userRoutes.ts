import { Router } from "express";
import { body, param } from "express-validator";
import {
    createUser,
    deleteUser,
    getCurrentSemester,
    getSemesterProgress,
    getUserById,
    getUserProfile,
    getUsers,
    login, // Import login
    updateCurrentSemester,
    updateUser,
    updateUserProfile,
    updateUserRole,
} from "../controllers/userController";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/requestValidatorMiddlwware";

const router: Router = Router();

// AUTH ROUTES
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    validateRequest,
    login
);

// PROFILE ROUTES (Protected)
router.get("/profile", requireAuth, getUserProfile);

router.put(
    "/profile",
    requireAuth,
    [
        body("name")
            .optional()
            .isString()
            .notEmpty()
            .withMessage("Name cannot be empty"),
        body("email")
            .optional()
            .isEmail()
            .withMessage("Valid email is required"),
    ],
    validateRequest,
    updateUserProfile
);

// USER CRUD ROUTES (Protected)
router.get("/", requireAuth, requireAdmin, getUsers);

router.get(
    "/:id",
    requireAuth,
    [param("id").isUUID().withMessage("Valid user ID is required")],
    validateRequest,
    getUserById
);

router.post(
    "/",
    [
        body("name").isString().notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),
        body("universityId")
            .isUUID()
            .withMessage("Valid university ID is required"),
    ],
    validateRequest,
    createUser
);

router.patch(
    "/:id",
    requireAuth,
    [param("id").isUUID().withMessage("Valid user ID is required")],
    validateRequest,
    updateUser
);

router.delete(
    "/:id",
    requireAuth,
    requireAdmin,
    [param("id").isUUID().withMessage("Valid user ID is required")],
    validateRequest,
    deleteUser
);

// ROLE MANAGEMENT
router.patch(
    "/:id/role",
    requireAuth,
    [
        param("id").isUUID().withMessage("Valid user ID is required"),
        body("role")
            .isIn(["STUDENT", "PROFESSOR", "VERIFIER", "ADMIN"])
            .withMessage("Invalid role specified"),
    ],
    validateRequest,
    updateUserRole
);

// SEMESTER MANAGEMENT ROUTES
router.get(
    "/:studentId/current-semester",
    requireAuth,
    [param("studentId").isUUID().withMessage("Valid student ID is required")],
    validateRequest,
    getCurrentSemester
);

router.get(
    "/:studentId/semester-progress",
    requireAuth,
    [param("studentId").isUUID().withMessage("Valid student ID is required")],
    validateRequest,
    getSemesterProgress
);

router.patch(
    "/:studentId/current-semester",
    requireAuth,
    [
        param("studentId").isUUID().withMessage("Valid student ID is required"),
        body("currentSemester")
            .isInt({ min: 1, max: 20 })
            .withMessage(
                "Current semester must be a valid number between 1 and 20"
            ),
    ],
    validateRequest,
    updateCurrentSemester
);

export default router;
