import { Request, Response } from "express";
import prisma from "@repo/db";
import { asyncHandler } from "../middleware/index";
import { ApiResponse } from "../types";

// Get grades for a professor's assigned sections
export const getProfessorGrades = asyncHandler(
    async (req: Request, res: Response) => {
        const { professorId } = req.params;
        const { sectionId, subjectId, examId } = req.query;

        // Get professor's section assignments
        const professorAssignments =
            await prisma.professorSectionAssignment.findMany({
                where: {
                    professorId,
                    isActive: true,
                    ...(sectionId && { sectionId: sectionId as string }),
                    ...(subjectId && { subjectId: subjectId as string }),
                },
                include: {
                    section: {
                        include: {
                            course: true,
                            semester: true,
                            academicYear: true,
                        },
                    },
                    subject: true,
                },
            });

        if (professorAssignments.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Professor has no section assignments",
            });
        }

        // Get students enrolled in professor's sections
        const sectionIds = professorAssignments.map(
            (assignment) => assignment.sectionId
        );
        const subjectIds = professorAssignments
            .map((assignment) => assignment.subjectId)
            .filter(Boolean);

        const grades = await prisma.grade.findMany({
            where: {
                ...(subjectIds.length > 0 && {
                    subjectId: {
                        in: subjectIds.filter((id) => id !== null) as string[],
                    },
                }),
                examResult: {
                    ...(examId && { examId: examId as string }),
                    student: {
                        sectionEnrollments: {
                            some: {
                                sectionId: { in: sectionIds },
                                status: "ACTIVE",
                            },
                        },
                    },
                },
            },
            include: {
                subject: true,
                examResult: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        exam: {
                            include: {
                                semester: true,
                            },
                        },
                    },
                },
            },
            orderBy: [
                { examResult: { exam: { examDate: "desc" } } },
                { examResult: { student: { name: "asc" } } },
            ],
        });

        res.json({
            success: true,
            message: "Professor grades retrieved successfully",
            data: {
                assignments: professorAssignments,
                grades,
            },
        });
    }
);

// Create or update grade for a student
export const createOrUpdateGrade = asyncHandler(
    async (req: Request, res: Response) => {
        const { professorId, examResultId, subjectId, marksObtained } =
            req.body;

        // Verify professor has permission to grade this student
        const examResult = await prisma.examResult.findUnique({
            where: { id: examResultId },
            include: {
                student: {
                    include: {
                        sectionEnrollments: {
                            where: { status: "ACTIVE" },
                            include: {
                                section: true,
                            },
                        },
                    },
                },
                exam: {
                    include: {
                        semester: true,
                    },
                },
            },
        });

        if (!examResult) {
            return res.status(404).json({
                success: false,
                message: "Exam result not found",
            });
        }

        // Check if professor is assigned to teach this subject in any of the student's sections
        const sectionIds = examResult.student.sectionEnrollments.map(
            (enrollment) => enrollment.sectionId
        );

        const professorAssignment =
            await prisma.professorSectionAssignment.findFirst({
                where: {
                    professorId,
                    sectionId: { in: sectionIds },
                    subjectId,
                    isActive: true,
                },
            });

        if (!professorAssignment) {
            return res.status(403).json({
                success: false,
                message:
                    "Professor is not authorized to grade this student for this subject",
            });
        }

        // Verify subject exists
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }

        // Check if grade already exists
        const existingGrade = await prisma.grade.findFirst({
            where: {
                examResultId,
                subjectId,
            },
        });

        let grade;
        if (existingGrade) {
            // Update existing grade
            grade = await prisma.grade.update({
                where: { id: existingGrade.id },
                data: { marksObtained },
                include: {
                    subject: true,
                    examResult: {
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                            exam: true,
                        },
                    },
                },
            });
        } else {
            // Create new grade
            grade = await prisma.grade.create({
                data: {
                    examResultId,
                    subjectId,
                    marksObtained,
                },
                include: {
                    subject: true,
                    examResult: {
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                            exam: true,
                        },
                    },
                },
            });
        }

        // Update exam result with calculated total marks and percentage
        const allGrades = await prisma.grade.findMany({
            where: { examResultId },
            include: { subject: true },
        });

        const totalMarksObtained = allGrades.reduce(
            (sum, g) => sum + g.marksObtained,
            0
        );
        const maxMarks = examResult.exam.maxMarks;
        const percentage = (totalMarksObtained / maxMarks) * 100;
        const status = percentage >= 50 ? "PASS" : "FAIL"; // Assuming 50% is passing

        await prisma.examResult.update({
            where: { id: examResultId },
            data: {
                totalMarksObtained,
                percentage,
                status: status as any,
                grade: percentage,
            },
        });

        res.status(existingGrade ? 200 : 201).json({
            success: true,
            message: existingGrade
                ? "Grade updated successfully"
                : "Grade created successfully",
            data: grade,
        });
    }
);

// Get students in professor's sections for grading
export const getProfessorStudentsForGrading = asyncHandler(
    async (req: Request, res: Response) => {
        const { professorId } = req.params;
        const { sectionId, subjectId, examId } = req.query;

        // Verify professor assignment
        const assignment = await prisma.professorSectionAssignment.findFirst({
            where: {
                professorId,
                sectionId: sectionId as string,
                subjectId: subjectId as string,
                isActive: true,
            },
            include: {
                section: {
                    include: {
                        course: true,
                        semester: true,
                    },
                },
                subject: true,
            },
        });

        if (!assignment) {
            return res.status(403).json({
                success: false,
                message: "Professor is not assigned to this section/subject",
            });
        }

        // Get exam details
        const exam = await prisma.exam.findUnique({
            where: { id: examId as string },
            include: {
                semester: true,
            },
        });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found",
            });
        }

        // Get students enrolled in the section
        const sectionEnrollments = await prisma.sectionEnrollment.findMany({
            where: {
                sectionId: sectionId as string,
                status: "ACTIVE",
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Get exam results and grades for these students
        const studentsWithGrades = await Promise.all(
            sectionEnrollments.map(async (enrollment) => {
                // Try to find existing exam result
                let examResult = await prisma.examResult.findFirst({
                    where: {
                        studentId: enrollment.studentId,
                        examId: examId as string,
                    },
                    include: {
                        grades: {
                            where: { subjectId: subjectId as string },
                            include: { subject: true },
                        },
                    },
                });

                // If no exam result exists, create one automatically
                if (!examResult) {
                    examResult = await prisma.examResult.create({
                        data: {
                            examId: examId as string,
                            studentId: enrollment.studentId,
                            status: "PENDING",
                            totalMarksObtained: null,
                            percentage: null,
                            grade: null,
                        },
                        include: {
                            grades: {
                                where: { subjectId: subjectId as string },
                                include: { subject: true },
                            },
                        },
                    });
                }

                return {
                    student: enrollment.student,
                    examResult,
                    currentGrade: examResult?.grades || null,
                };
            })
        );

        res.json({
            success: true,
            message: "Students for grading retrieved successfully",
            data: {
                assignment,
                exam,
                studentsWithGrades,
            },
        });
    }
);

// Get exams for professor's subjects
export const getProfessorExams = asyncHandler(
    async (req: Request, res: Response) => {
        const { professorId } = req.params;
        const { sectionId, subjectId } = req.query;

        // Get professor's assignments
        const assignments = await prisma.professorSectionAssignment.findMany({
            where: {
                professorId,
                isActive: true,
                ...(sectionId && { sectionId: sectionId as string }),
                ...(subjectId && { subjectId: subjectId as string }),
            },
            include: {
                section: {
                    include: {
                        semester: true,
                        course: true,
                    },
                },
                subject: true,
            },
        });

        if (assignments.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Professor has no section assignments",
            });
        }

        // Get exams for the semesters of assigned sections
        const semesterIds = assignments.map(
            (assignment) => assignment.section.semesterId
        );

        const exams = await prisma.exam.findMany({
            where: {
                semesterId: { in: semesterIds },
            },
            include: {
                semester: {
                    include: {
                        course: true,
                    },
                },
                results: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        grades: {
                            include: {
                                subject: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                examDate: "desc",
            },
        });

        res.json({
            success: true,
            message: "Professor exams retrieved successfully",
            data: {
                assignments,
                exams,
            },
        });
    }
);

// Delete grade (only by professor who created it)
export const deleteGrade = asyncHandler(async (req: Request, res: Response) => {
    const { gradeId } = req.params;
    const { professorId } = req.body;

    // Get grade with related data
    const grade = await prisma.grade.findUnique({
        where: { id: gradeId },
        include: {
            examResult: {
                include: {
                    student: {
                        include: {
                            sectionEnrollments: {
                                where: { status: "ACTIVE" },
                            },
                        },
                    },
                },
            },
            subject: true,
        },
    });

    if (!grade) {
        return res.status(404).json({
            success: false,
            message: "Grade not found",
        });
    }

    // Verify professor has permission
    const sectionIds = grade.examResult.student.sectionEnrollments.map(
        (enrollment) => enrollment.sectionId
    );

    const professorAssignment =
        await prisma.professorSectionAssignment.findFirst({
            where: {
                professorId,
                sectionId: { in: sectionIds },
                subjectId: grade.subjectId,
                isActive: true,
            },
        });

    if (!professorAssignment) {
        return res.status(403).json({
            success: false,
            message: "Professor is not authorized to delete this grade",
        });
    }

    await prisma.grade.delete({
        where: { id: gradeId },
    });

    // Recalculate exam result totals
    const remainingGrades = await prisma.grade.findMany({
        where: { examResultId: grade.examResultId },
    });

    const totalMarksObtained = remainingGrades.reduce(
        (sum, g) => sum + g.marksObtained,
        0
    );
    const examResult = await prisma.examResult.findUnique({
        where: { id: grade.examResultId },
        include: { exam: true },
    });

    if (examResult) {
        const percentage =
            totalMarksObtained > 0
                ? (totalMarksObtained / examResult.exam.maxMarks) * 100
                : 0;
        const status =
            percentage >= 50
                ? "PASS"
                : remainingGrades.length > 0
                  ? "FAIL"
                  : "PENDING";

        await prisma.examResult.update({
            where: { id: grade.examResultId },
            data: {
                totalMarksObtained: totalMarksObtained || null,
                percentage: percentage || null,
                status: status as any,
                grade: percentage || null,
            },
        });
    }

    res.json({
        success: true,
        message: "Grade deleted successfully",
    });
});
