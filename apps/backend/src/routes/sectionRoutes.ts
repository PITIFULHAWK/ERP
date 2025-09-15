import { Router } from "express";
import {
    assignStudentToSection,
    assignProfessorToSection,
    getAllSections,
    getProfessorSections,
    getStudentSections,
    createSection,
} from "../controllers/sectionController";

const router: Router = Router();

// Section management routes
router.post("/", createSection);
router.get("/", getAllSections);

// Student section assignment
router.post("/assign-student", assignStudentToSection);
router.get("/student/:studentId", getStudentSections);

// Professor section assignment
router.post("/assign-professor", assignProfessorToSection);
router.get("/professor/:professorId", getProfessorSections);

export default router;
