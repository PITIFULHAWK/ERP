import { Router } from "express";
import { body, param } from "express-validator";
import {
    getHostels,
    getHostelById,
    createHostel,
    updateHostel,
    deleteHostel,
    addStudentToHostel,
} from "../controllers/hostelController";
import { requireAuth, requireStaff } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/requestValidatorMiddlwware";

const router: Router = Router();

// Public route - anyone can see the list of hostels
router.get("/", getHostels);

// Staff-only routes below, all with input validation
router.get(
    "/:id",
    requireAuth,
    requireStaff,
    [param("id").isUUID().withMessage("Valid hostel ID is required")],
    validateRequest,
    getHostelById
);

router.post(
    "/",
    requireAuth,
    requireStaff,
    [
        body("name")
            .isString()
            .notEmpty()
            .withMessage("Hostel name is required"),
        body("type")
            .isIn(["AC", "NON_AC"])
            .withMessage("Type must be AC or NON_AC"),
        body("totalCapacity")
            .isInt({ min: 1 })
            .withMessage("Capacity must be a positive integer"),
        body("fees")
            .isFloat({ gt: 0 })
            .withMessage("Fees must be a positive number"),
        body("universityId")
            .isUUID()
            .withMessage("A valid university ID is required"),
    ],
    validateRequest,
    createHostel
);

router.patch(
    "/:id",
    requireAuth,
    requireStaff,
    [
        param("id").isUUID().withMessage("Valid hostel ID is required"),
        body("name").optional().isString().notEmpty(),
        body("type").optional().isIn(["AC", "NON_AC"]),
        body("totalCapacity").optional().isInt({ min: 1 }),
        body("fees").optional().isFloat({ gt: 0 }),
    ],
    validateRequest,
    updateHostel
);

router.patch(
    "/:hostelId/add-student/:userId",
    requireAuth,
    requireStaff, // Or requireAdmin, depending on your rules
    [
        param("hostelId").isUUID().withMessage("Valid hostel ID is required"),
        param("userId").isUUID().withMessage("Valid user ID is required"),
    ],
    validateRequest,
    addStudentToHostel
);

router.delete(
    "/:id",
    requireAuth,
    requireStaff,
    [param("id").isUUID().withMessage("Valid hostel ID is required")],
    validateRequest,
    deleteHostel
);

export default router;
