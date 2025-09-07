import { Router } from "express";
import { body, param } from "express-validator";
import {
    createSemester,
    deleteSemester,
    getSemesters,
    getSemestersByCourse,
    updateSemester,
} from "../controllers/semesterController";
import {
    requireAdmin,
    requireAuth,
    requireStaff,
} from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/requestValidatorMiddlwware";

const router: Router = Router();

// TODO: create a get route to get all the semester details (if necessary)
router.get("/", getSemesters);

router.post(
    "/",
    requireAuth,
    requireStaff,
    [
        body("courseId").isUUID().withMessage("Valid Course ID is required"),
        body("code")
            .isString()
            .withMessage("Semester number must be a positive integer"),
    ],
    validateRequest,
    createSemester
);

router.get(
    "/:courseId",
    requireAuth,
    [param("courseId").isUUID().withMessage("Valid Course ID is required")],
    validateRequest,
    getSemestersByCourse
);

router.patch(
    "/:semesterId",
    requireAuth,
    requireStaff,
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
    requireAuth,
    requireStaff,
    [param("semesterId").isUUID().withMessage("Valid Semester ID is required")],
    validateRequest,
    deleteSemester
);

export default router;
