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
            _count: {
                select: {
                    results: true,
                },
            },
        },
        orderBy: {
            examDate: "asc",
        },
    });

    const response: ApiResponse = {
        success: true,
        message: "Exams retrieved successfully",
        data: exams,
    };

    res.json(response);
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
        const response: ApiResponse = {
            success: false,
            message: "Exam not found",
        };
        return res.status(404).json(response);
    }

    const response: ApiResponse = {
        success: true,
        message: "Exam retrieved successfully",
        data: exam,
    };

    res.json(response);
});

// Create exam
export const createExam = asyncHandler(async (req: Request, res: Response) => {
    const { name, type, examDate, maxMarks, semesterId } = req.body;

    // Check if semester exists
    const semester = await prisma.semester.findUnique({
        where: { id: semesterId },
    });

    if (!semester) {
        const response: ApiResponse = {
            success: false,
            message: "Semester not found",
        };
        return res.status(404).json(response);
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
        const response: ApiResponse = {
            success: false,
            message:
                "Exam with this name and type already exists for this semester",
        };
        return res.status(400).json(response);
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

    const response: ApiResponse = {
        success: true,
        message: "Exam created successfully",
        data: exam,
    };

    res.status(201).json(response);
});

// Update exam
export const updateExam = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, type, examDate, maxMarks } = req.body;

    const existingExam = await prisma.exam.findUnique({
        where: { id },
    });

    if (!existingExam) {
        const response: ApiResponse = {
            success: false,
            message: "Exam not found",
        };
        return res.status(404).json(response);
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

    const response: ApiResponse = {
        success: true,
        message: "Exam updated successfully",
        data: exam,
    };

    res.json(response);
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
        const response: ApiResponse = {
            success: false,
            message: "Exam not found",
        };
        return res.status(404).json(response);
    }

    // Check if exam has results
    if (existingExam.results.length > 0) {
        const response: ApiResponse = {
            success: false,
            message: "Cannot delete exam with existing results",
        };
        return res.status(400).json(response);
    }

    await prisma.exam.delete({
        where: { id },
    });

    const response: ApiResponse = {
        success: true,
        message: "Exam deleted successfully",
    };

    res.json(response);
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
            const response: ApiResponse = {
                success: false,
                message: "Exam not found",
            };
            return res.status(404).json(response);
        }

        // Check if student exists
        const student = await prisma.user.findUnique({
            where: { id: studentId },
        });

        if (!student) {
            const response: ApiResponse = {
                success: false,
                message: "Student not found",
            };
            return res.status(404).json(response);
        }

        // Check if result already exists
        const existingResult = await prisma.examResult.findFirst({
            where: {
                examId,
                studentId,
            },
        });

        if (existingResult) {
            const response: ApiResponse = {
                success: false,
                message: "Result already exists for this student and exam",
            };
            return res.status(400).json(response);
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

        const response: ApiResponse = {
            success: true,
            message: "Exam result created successfully",
            data: result,
        };

        res.status(201).json(response);
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

        const response: ApiResponse = {
            success: true,
            message: "Exam results retrieved successfully",
            data: results,
        };

        res.json(response);
    }
);
