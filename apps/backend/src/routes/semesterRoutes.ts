import { Router } from "express";
import { body, param } from "express-validator";
import {
    createSemester,
    deleteSemester,
    getSemestersByCourse,
    updateSemester,
} from "../controllers/semesterController";
import { requireAdmin } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/requestValidatorMiddlwware";

const router: Router = Router();

router.post(
    "/",
    requireAdmin,
    [
        body("courseId").isUUID().withMessage("Valid Course ID is required"),
        body("number")
            .isInt({ gt: 0 })
            .withMessage("Semester number must be a positive integer"),
    ],
    validateRequest,
    createSemester
);

router.get(
    "/:courseId",
    [param("courseId").isUUID().withMessage("Valid Course ID is required")],
    validateRequest,
    getSemestersByCourse
);

router.patch(
    "/:semesterId",
    requireAdmin,
    [
        param("semesterId")
            .isUUID()
            .withMessage("Valid Semester ID is required"),
        body("number")
            .isInt({ gt: 0 })
            .withMessage("Semester number must be a positive integer"),
    ],
    validateRequest,
    updateSemester
);

// DELETE route to delete a semester
router.delete(
    "/:semesterId",
    requireAdmin,
    [param("semesterId").isUUID().withMessage("Valid Semester ID is required")],
    validateRequest,
    deleteSemester
);

export default router;
