import { Request, Response } from "express";
import prisma from "@repo/db";
import { asyncHandler } from "../middleware/index";
import { ApiResponse } from "../types";

// Helper: recompute student's CGPA from SGPA per semester and persist to active enrollments
// SGPA is computed as average of examResult.grade (percentage/10) per semester
// CGPA is computed as weighted average of SGPA by total credits offered in that semester
async function recomputeAndPersistStudentCgpa(studentId: string) {
    // 1) Fetch all exam results with their semesters
    const results = await prisma.examResult.findMany({
        where: {
            studentId,
            grade: { not: null },
        },
        select: {
            grade: true, // percentage
            exam: { select: { semesterId: true } },
        },
    });

    if (results.length === 0) {
        await prisma.studentEnrollment.updateMany({
            where: { studentId, status: "ACTIVE" as any },
            data: { cgpa: null as any },
        });
        return null;
    }

    // 2) Group grades by semesterId and compute SGPA (avg of percentage/10)
    const bySemester = new Map<string, number[]>();
    for (const r of results) {
        const semId = r.exam.semesterId;
        if (!semId) continue;
        const gp = (r.grade as number) / 10; // 10-point scale
        if (!bySemester.has(semId)) bySemester.set(semId, []);
        if (!Number.isNaN(gp)) bySemester.get(semId)!.push(gp);
    }

    if (bySemester.size === 0) {
        await prisma.studentEnrollment.updateMany({
            where: { studentId, status: "ACTIVE" as any },
            data: { cgpa: null as any },
        });
        return null;
    }

    // 3) For each semester, get total credits from subjects in that semester
    const semesterIds = Array.from(bySemester.keys());
    const subjects = await prisma.subject.findMany({
        where: { semesterId: { in: semesterIds } },
        select: { semesterId: true, credits: true },
    });
    const creditsBySem = new Map<string, number>();
    for (const s of subjects) {
        creditsBySem.set(s.semesterId, (creditsBySem.get(s.semesterId) || 0) + s.credits);
    }

    // 4) Compute weighted CGPA across semesters
    let weightedSum = 0;
    let totalCreditsAllSems = 0;
    for (const [semId, gpas] of bySemester.entries()) {
        if (gpas.length === 0) continue;
        const sgpa = gpas.reduce((a, b) => a + b, 0) / gpas.length;
        const semCredits = creditsBySem.get(semId) || 0;
        // Fallback: if no credits found for a semester, treat as 1 to avoid zero weights
        const weight = semCredits > 0 ? semCredits : 1;
        weightedSum += sgpa * weight;
        totalCreditsAllSems += weight;
    }

    const cgpa = totalCreditsAllSems > 0
        ? parseFloat((weightedSum / totalCreditsAllSems).toFixed(2))
        : null;

    await prisma.studentEnrollment.updateMany({
        where: { studentId, status: "ACTIVE" as any },
        data: { cgpa: (cgpa as any) },
    });

    return cgpa;
}

// Get a student's grades summary: subject-wise marks per semester, SGPA per semester, CGPA overall
export const getStudentGradesSummary = asyncHandler(
    async (req: Request, res: Response) => {
        const { studentId } = req.params as { studentId: string };

        // Fetch all exam results with grades and related info, including semester details
        const results = await prisma.examResult.findMany({
            where: { studentId },
            include: {
                exam: {
                    select: {
                        id: true,
                        semesterId: true,
                        maxMarks: true,
                        examDate: true,
                        semester: { select: { id: true, number: true, code: true } },
                    },
                },
                grades: {
                    include: {
                        subject: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                                credits: true,
                                semesterId: true,
                            },
                        },
                    },
                },
            },
            orderBy: { exam: { examDate: "asc" } },
        });

        type SubjectMark = {
            subjectId: string;
            subjectName: string;
            subjectCode: string;
            credits: number;
            marksObtained: number;
        };

        type SemesterSummary = {
            semesterId: string;
            semesterNumber: number | null;
            semesterCode: string | null;
            subjects: SubjectMark[];
            sgpa: number | null;
        };

        const bySemester = new Map<string, SemesterSummary>();

        for (const r of results) {
            const semId = r.exam.semesterId;
            if (!semId) continue;
            if (!bySemester.has(semId)) {
                bySemester.set(semId, {
                    semesterId: semId,
                    semesterNumber: r.exam.semester?.number ?? null,
                    semesterCode: r.exam.semester?.code ?? null,
                    subjects: [],
                    sgpa: null,
                });
            }
            const sem = bySemester.get(semId)!;
            for (const g of r.grades) {
                sem.subjects.push({
                    subjectId: g.subject.id,
                    subjectName: g.subject.name,
                    subjectCode: g.subject.code,
                    credits: g.subject.credits,
                    marksObtained: g.marksObtained,
                });
            }
        }

        // Compute SGPA per semester (average of examResult.grade/10 for that semester)
        const sMap = new Map<string, number[]>();
        for (const r of results) {
            const semId = r.exam.semesterId;
            if (!semId || r.grade == null) continue;
            const gp = (r.grade as number) / 10;
            if (!Number.isNaN(gp)) {
                if (!sMap.has(semId)) sMap.set(semId, []);
                sMap.get(semId)!.push(gp);
            }
        }
        for (const [semId, list] of sMap.entries()) {
            const sem = bySemester.get(semId);
            if (sem) sem.sgpa = list.length > 0 ? parseFloat((list.reduce((a, b) => a + b, 0) / list.length).toFixed(2)) : null;
        }

        // Overall CGPA (also persists to StudentEnrollment)
        const cgpa = await recomputeAndPersistStudentCgpa(studentId);

        const semesters: SemesterSummary[] = Array.from(bySemester.values()).sort((a, b) => {
            const an = a.semesterNumber ?? 0;
            const bn = b.semesterNumber ?? 0;
            return an - bn;
        });

        res.json({
            success: true,
            message: "Grades summary retrieved successfully",
            data: { cgpa, semesters },
        });
    }
);
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

        // Recompute student's CGPA and persist on ACTIVE enrollments for placement eligibility
        await recomputeAndPersistStudentCgpa(examResult.student.id);

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

    // Recompute student's CGPA after deletion as well
    await recomputeAndPersistStudentCgpa(grade.examResult.studentId);

    res.json({
        success: true,
        message: "Grade deleted successfully",
    });
});
