import { Router } from "express";
import { body, param } from "express-validator";
import {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    login, // Import login
    updateUser,
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

export default router;
