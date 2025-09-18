import { Request, Response } from "express";
import prisma from "@repo/db";
import { ApiResponse } from "../types";
import { asyncHandler } from "../middleware";

// Get all subjects
export const getSubjects = asyncHandler(async (req: Request, res: Response) => {
    const { semesterId } = req.query;

    const subjects = await prisma.subject.findMany({
        where: semesterId ? { semesterId: semesterId as string } : {},
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
            _count: {
                select: {
                    attendances: true,
                },
            },
        },
        orderBy: {
            code: "asc",
        },
    });

    const response: ApiResponse = {
        success: true,
        message: "Subjects retrieved successfully",
        data: subjects,
    };

    res.json(response);
});

// Get subject by ID
export const getSubjectById = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const subject = await prisma.subject.findUnique({
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
                Grade: {
                    include: {
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
                },
            },
        });

        if (!subject) {
            const response: ApiResponse = {
                success: false,
                message: "Subject not found",
            };
            return res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: true,
            message: "Subject retrieved successfully",
            data: subject,
        };

        res.json(response);
    }
);

// Create subject
export const createSubject = asyncHandler(
    async (req: Request, res: Response) => {
        const { name, code, credits, semesterId } = req.body;

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

        // Check if subject code already exists
        const existingSubject = await prisma.subject.findUnique({
            where: { code },
        });

        if (existingSubject) {
            const response: ApiResponse = {
                success: false,
                message: "Subject with this code already exists",
            };
            return res.status(400).json(response);
        }

        const subject = await prisma.subject.create({
            data: {
                name,
                code,
                credits,
                semesterId,
            },
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
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Subject created successfully",
            data: subject,
        };

        res.status(201).json(response);
    }
);

// Update subject
export const updateSubject = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, code, credits } = req.body;

        const existingSubject = await prisma.subject.findUnique({
            where: { id },
        });

        if (!existingSubject) {
            const response: ApiResponse = {
                success: false,
                message: "Subject not found",
            };
            return res.status(404).json(response);
        }

        // Check if code is being updated and if it conflicts with existing codes
        if (code && code !== existingSubject.code) {
            const codeConflict = await prisma.subject.findUnique({
                where: { code },
            });

            if (codeConflict) {
                const response: ApiResponse = {
                    success: false,
                    message: "Subject with this code already exists",
                };
                return res.status(400).json(response);
            }
        }

        const subject = await prisma.subject.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(code && { code }),
                ...(credits !== undefined && { credits }),
            },
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
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Subject updated successfully",
            data: subject,
        };

        res.json(response);
    }
);

// Delete subject
export const deleteSubject = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const existingSubject = await prisma.subject.findUnique({
            where: { id },
            include: {
                Grade: true,
            },
        });

        if (!existingSubject) {
            const response: ApiResponse = {
                success: false,
                message: "Subject not found",
            };
            return res.status(404).json(response);
        }

        // Check if subject has grades
        if (existingSubject.Grade) {
            const response: ApiResponse = {
                success: false,
                message: "Cannot delete subject with existing grades",
            };
            return res.status(400).json(response);
        }

        await prisma.subject.delete({
            where: { id },
        });

        const response: ApiResponse = {
            success: true,
            message: "Subject deleted successfully",
        };

        res.json(response);
    }
);

// Create grade for a subject
export const createGrade = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const { examResultId, marksObtained } = req.body;

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
    });

    if (!subject) {
        const response: ApiResponse = {
            success: false,
            message: "Subject not found",
        };
        return res.status(404).json(response);
    }

    // Check if exam result exists
    const examResult = await prisma.examResult.findUnique({
        where: { id: examResultId },
    });

    if (!examResult) {
        const response: ApiResponse = {
            success: false,
            message: "Exam result not found",
        };
        return res.status(404).json(response);
    }

    // Check if grade already exists
    const existingGrade = await prisma.grade.findFirst({
        where: {
            subjectId,
            examResultId,
        },
    });

    if (existingGrade) {
        const response: ApiResponse = {
            success: false,
            message: "Grade already exists for this subject and exam result",
        };
        return res.status(400).json(response);
    }

    const newGrade = await prisma.grade.create({
        data: {
            subjectId,
            examResultId,
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

    const response: ApiResponse = {
        success: true,
        message: "Grade created successfully",
        data: newGrade,
    };

    res.status(201).json(response);
});
