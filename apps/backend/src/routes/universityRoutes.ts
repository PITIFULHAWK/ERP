import { Router } from "express";
import { body, param } from "express-validator";
import {
    getUniversities,
    getUniversityById,
    createUniversity,
    updateUniversity,
    deleteUniversity,
    onboardUniversity,
} from "../controllers/universityController";
import { requireAuth, requireStaff } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/requestValidatorMiddlwware";

const router: Router = Router();

// Public route - anyone can see the list of universities
router.get("/", getUniversities);

// Special onboarding route for creating university with first admin
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
            .withMessage("Valid admin email is required"),
        body("adminPassword")
            .isLength({ min: 6 })
            .withMessage("Admin password must be at least 6 characters"),
    ],
    validateRequest,
    onboardUniversity
);

// Staff-only routes below, all with input validation
router.get(
    "/:id",
    requireAuth,
    requireStaff,
    [param("id").isUUID().withMessage("Valid university ID is required")],
    validateRequest,
    getUniversityById
);

router.post(
    "/",
    requireAuth,
    requireStaff,
    [
        body("name")
            .isString()
            .notEmpty()
            .withMessage("University name is required"),
    ],
    validateRequest,
    createUniversity
);

router.patch(
    "/:id",
    requireAuth,
    requireStaff,
    [
        param("id").isUUID().withMessage("Valid university ID is required"),
        body("name").optional().isString().notEmpty(),
    ],
    validateRequest,
    updateUniversity
);

router.delete(
    "/:id",
    requireAuth,
    requireStaff,
    [param("id").isUUID().withMessage("Valid university ID is required")],
    validateRequest,
    deleteUniversity
);

export default router;
