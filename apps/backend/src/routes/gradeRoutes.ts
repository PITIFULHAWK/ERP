import { Router } from "express";
import { body, param } from "express-validator";
import {
    getProfessorGrades,
    createOrUpdateGrade,
    getProfessorStudentsForGrading,
    getProfessorExams,
    deleteGrade,
} from "../controllers/gradeController";
import { requireAuth, requireProfessor } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/requestValidatorMiddlwware";

const router: Router = Router();

// Professor grade management routes
router.get(
    "/professor/:professorId",
    requireAuth,
    requireProfessor,
    [
        param("professorId")
            .isUUID()
            .withMessage("Valid professor ID is required"),
    ],
    validateRequest,
    getProfessorGrades
);

router.get(
    "/professor/:professorId/students",
    requireAuth,
    requireProfessor,
    [
        param("professorId")
            .isUUID()
            .withMessage("Valid professor ID is required"),
        // Query params are optional
    ],
    validateRequest,
    getProfessorStudentsForGrading
);

router.get(
    "/professor/:professorId/exams",
    requireAuth,
    requireProfessor,
    [
        param("professorId")
            .isUUID()
            .withMessage("Valid professor ID is required"),
    ],
    validateRequest,
    getProfessorExams
);

router.post(
    "/",
    requireAuth,
    requireProfessor,
    [
        body("professorId")
            .isUUID()
            .withMessage("Valid professor ID is required"),
        body("examResultId")
            .isUUID()
            .withMessage("Valid exam result ID is required"),
        body("subjectId").isUUID().withMessage("Valid subject ID is required"),
        body("marksObtained")
            .isFloat({ min: 0 })
            .withMessage("Marks obtained must be a positive number"),
    ],
    validateRequest,
    createOrUpdateGrade
);

router.delete(
    "/:gradeId",
    requireAuth,
    requireProfessor,
    [
        param("gradeId").isUUID().withMessage("Valid grade ID is required"),
        body("professorId")
            .isUUID()
            .withMessage("Valid professor ID is required"),
    ],
    validateRequest,
    deleteGrade
);

export default router;
