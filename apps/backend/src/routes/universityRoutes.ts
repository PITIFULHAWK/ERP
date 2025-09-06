import { Router } from "express";
import { body, param } from "express-validator";
import {
    deleteUniversity,
    getUniversityById,
    getUniversities,
    onboardUniversity,
    updateUniversity,
} from "../controllers/universityController";
import { requireAdmin } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/requestValidatorMiddlwware";

const router: Router = Router();

// GET all universities
router.get("/", getUniversities);

// GET university by ID
router.get(
    "/:id",
    [param("id").isUUID().withMessage("Valid University ID is required")],
    validateRequest,
    getUniversityById
);

// POST onboard a new university and its first admin
// This route is now public and does not require admin authentication.
router.post(
    "/onboard",
    [
        body("universityName")
            .isString()
            .notEmpty()
            .withMessage("University name is required"),
        body("adminName")
            .isString()
            .notEmpty()
            .withMessage("Admin name is required"),
        body("adminEmail")
            .isEmail()
            .withMessage("A valid admin email is required"),
    ],
    validateRequest,
    onboardUniversity
);

// PATCH update university (Admin only)
router.patch(
    "/:id",
    requireAdmin,
    [param("id").isUUID().withMessage("Valid University ID is required")],
    validateRequest,
    updateUniversity
);

// DELETE university (Admin only)
router.delete(
    "/:id",
    requireAdmin,
    [param("id").isUUID().withMessage("Valid University ID is required")],
    validateRequest,
    deleteUniversity
);

export default router;
