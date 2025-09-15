import { Request, Response } from "express";
import prisma from "@repo/db";
import { ApiResponse } from "../types";
import { asyncHandler } from "../middleware";

// Get all exams
export const getExams = asyncHandler(async (req: Request, res: Response) => {
    const { semesterId, type } = req.query;

    const exams = await prisma.exam.findMany({
        where: {
            ...(semesterId && { semesterId: semesterId as string }),
            ...(type && { type: type as any }),
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
                },
            },
        },
        orderBy: {
            examDate: "asc",
        },
    });

    res.json({
        success: true,
        message: "Exams retrieved successfully",
        data: exams,
    });
});

// Get exam by ID
export const getExamById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const exam = await prisma.exam.findUnique({
        where: { id },
        include: {
            semester: {
                include: {
                    course: {
                        include: {
                            university: true,
                        },
                    },
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
    });

    if (!exam) {
        return res.status(404).json({
            success: false,
            message: "Exam not found",
        });
    }

    res.json({
        success: true,
        message: "Exam retrieved successfully",
        data: exam,
    });
});

// Create exam
export const createExam = asyncHandler(async (req: Request, res: Response) => {
    const { name, type, examDate, maxMarks, semesterId } = req.body;

    // Check if semester exists
    const semester = await prisma.semester.findUnique({
        where: { id: semesterId },
    });

    if (!semester) {
        return res.status(404).json({
            success: false,
            message: "Semester not found",
        });
    }

    // Check if exam already exists for this semester
    const existingExam = await prisma.exam.findFirst({
        where: {
            semesterId,
            name,
            type,
        },
    });

    if (existingExam) {
        return res.status(400).json({
            success: false,
            message:
                "Exam with this name and type already exists for this semester",
        });
    }

    const exam = await prisma.exam.create({
        data: {
            name,
            type,
            examDate: new Date(examDate),
            maxMarks,
            semesterId,
        },
        include: {
            semester: {
                include: {
                    course: true,
                },
            },
        },
    });

    res.status(201).json({
        success: true,
        message: "Exam created successfully",
        data: exam,
    });
});

// Update exam
export const updateExam = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, type, examDate, maxMarks } = req.body;

    const existingExam = await prisma.exam.findUnique({
        where: { id },
    });

    if (!existingExam) {
        return res.status(404).json({
            success: false,
            message: "Exam not found",
        });
    }

    const exam = await prisma.exam.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(type && { type }),
            ...(examDate && { examDate: new Date(examDate) }),
            ...(maxMarks !== undefined && { maxMarks }),
        },
        include: {
            semester: {
                include: {
                    course: true,
                },
            },
            results: true,
        },
    });

    res.json({
        success: true,
        message: "Exam updated successfully",
        data: exam,
    });
});

// Delete exam
export const deleteExam = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const existingExam = await prisma.exam.findUnique({
        where: { id },
        include: {
            results: true,
        },
    });

    if (!existingExam) {
        return res.status(404).json({
            success: false,
            message: "Exam not found",
        });
    }

    // Check if exam has results (temporary fix until Prisma client is regenerated)
    if (existingExam.results) {
        return res.status(400).json({
            success: false,
            message: "Cannot delete exam with existing results",
        });
    }

    await prisma.exam.delete({
        where: { id },
    });

    res.json({
        success: true,
        message: "Exam deleted successfully",
    });
});

// Create exam result
export const createExamResult = asyncHandler(
    async (req: Request, res: Response) => {
        const { examId } = req.params;
        const {
            studentId,
            totalMarksObtained,
            percentage,
            status,
            remarks,
            grade,
        } = req.body;

        // Check if exam exists
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
        });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found",
            });
        }

        // Check if student exists
        const student = await prisma.user.findUnique({
            where: { id: studentId },
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        // Check if result already exists
        const existingResult = await prisma.examResult.findFirst({
            where: {
                examId,
                studentId,
            },
        });

        if (existingResult) {
            return res.status(400).json({
                success: false,
                message: "Result already exists for this student and exam",
            });
        }

        const result = await prisma.examResult.create({
            data: {
                examId,
                studentId,
                totalMarksObtained,
                percentage,
                status,
                remarks,
                grade,
            },
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
        });

        res.status(201).json({
            success: true,
            message: "Exam result created successfully",
            data: result,
        });
    }
);

// Get exam results for a specific exam
export const getExamResults = asyncHandler(
    async (req: Request, res: Response) => {
        const { examId } = req.params;

        const results = await prisma.examResult.findMany({
            where: { examId },
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
            orderBy: {
                student: {
                    name: "asc",
                },
            },
        });

        res.json({
            success: true,
            message: "Exam results retrieved successfully",
            data: results,
        });
    }
);
