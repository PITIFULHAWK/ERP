import { Request, Response } from "express";
import { asyncHandler } from "../middleware/index";
import prisma from "@repo/db";
import { ApiResponse } from "../types";

export const getSemesters = asyncHandler(
    async (req: Request, res: Response) => {
        const { courseId, universityId } = req.query;

        const semesters = await prisma.semester.findMany({
            where: {
                ...(courseId && { courseId: courseId as string }),
                ...(universityId && {
                    course: { universityId: universityId as string },
                }),
            },
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                subjects: true,
            },
            orderBy: {
                number: "asc",
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Semesters retrieved successfully",
            data: semesters.map((s) => ({
                ...s,
                // computed per-semester fees
                fees:
                    (s.course as any)?.totalFees && s.course
                        ? (s.course as any).totalFees / (s.course as any).totalSemester
                        : null,
            })),
        };

        res.json(response);
    }
);

// Create a new semester with automatic numbering
export const createSemester = asyncHandler(
    async (req: Request, res: Response) => {
        const { courseId, code } = req.body;

        // 1. Check if a semester with the same code already exists
        const existingSemester = await prisma.semester.findUnique({
            where: { code },
        });

        if (existingSemester) {
            return res.status(409).json({
                success: false,
                message: `A semester with code '${code}' already exists.`,
            });
        }

        // 2. Get the parent course and a count of its existing semesters
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                _count: {
                    select: { semester: true },
                },
            },
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: `Course with ID ${courseId} not found.`,
            });
        }

        // 3. Automatically determine the new semester number
        const newSemesterNumber = course._count.semester + 1;

        // 4. Validate that we are not exceeding the total semesters for the course
        if (newSemesterNumber > course.totalSemester) {
            return res.status(400).json({
                success: false,
                message: `Cannot add new semester. The course's limit of ${course.totalSemester} semesters has been reached.`,
            });
        }

        // 5. Create the new semester with the calculated number
        const newSemester = await prisma.semester.create({
            data: {
                code,
                number: newSemesterNumber,
                course: {
                    connect: { id: courseId },
                },
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Semester created successfully",
            data: newSemester,
        };

        res.status(201).json(response);
    }
);

export const getSemestersByCourse = asyncHandler(
    async (req: Request, res: Response) => {
        const { courseId } = req.params;

        // First, check if the course exists to provide a clear error message
        const courseExists = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!courseExists) {
            const response: ApiResponse = {
                success: false,
                message: "Course not found",
                error: `Course with ID ${courseId} does not exist.`,
            };
            return res.status(404).json(response);
        }

        // If the course exists, fetch all its semesters
        const semesters = await prisma.semester.findMany({
            where: {
                courseId: courseId,
            },
            orderBy: {
                number: "asc", // Order the semesters by number (1, 2, 3...)
            },
            include: {
                subjects: true, // Also include the subjects for each semester
            },
        });

        const response: ApiResponse = {
            success: true,
            message: `Semesters for course ${courseId} fetched successfully`,
            data: semesters.map((s) => ({
                ...s,
                fees:
                    (s as any).course
                        ? ((s as any).course.totalFees /
                              (s as any).course.totalSemester)
                        : null,
            })),
        };

        res.status(200).json(response);
    }
);

export const updateSemester = asyncHandler(
    async (req: Request, res: Response) => {
        const { semesterId } = req.params;
        const { number, code } = req.body as { number?: number; code?: string };

        // 1. Find the semester to ensure it exists
        const semester = await prisma.semester.findUnique({
            where: { id: semesterId },
            include: { course: true }, // Include course to check total semesters
        });

        if (!semester) {
            const response: ApiResponse = {
                success: false,
                message: "Semester not found",
                error: `Semester with ID ${semesterId} does not exist.`,
            };
            return res.status(404).json(response);
        }

        // 2. Validate the new semester number (if provided)
        if (typeof number === "number") {
            if (number < 1 || number > semester.course.totalSemester) {
                const response: ApiResponse = {
                    success: false,
                    message: "Invalid semester number",
                    error: `Semester number ${number} must be between 1 and ${semester.course.totalSemester}.`,
                };
                return res.status(400).json(response);
            }
        }

        // 3. If code is provided, ensure uniqueness
        if (code && code !== semester.code) {
            const existingCode = await prisma.semester.findUnique({ where: { code } });
            if (existingCode) {
                const response: ApiResponse = {
                    success: false,
                    message: "Semester code already exists",
                    error: `A semester with code '${code}' already exists. Please choose a different code.`,
                };
                return res.status(409).json(response);
            }
        }

        // 4. Perform the update
        const updatedSemester = await prisma.semester.update({
            where: { id: semesterId },
            data: {
                ...(typeof number === "number" ? { number } : {}),
                ...(code ? { code } : {}),
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Semester updated successfully",
            data: updatedSemester,
        };

        res.status(200).json(response);
    }
);

export const deleteSemester = asyncHandler(
    async (req: Request, res: Response) => {
        const { semesterId } = req.params;

        // 1. Check if the semester exists before trying to delete
        const semesterExists = await prisma.semester.findUnique({
            where: { id: semesterId },
        });

        if (!semesterExists) {
            const response: ApiResponse = {
                success: false,
                message: "Semester not found",
                error: `Semester with ID ${semesterId} does not exist.`,
            };
            return res.status(404).json(response);
        }

        // 2. Guard: ensure no dependent records exist to avoid FK constraint errors
        const [subjectCount, examCount] = await Promise.all([
            prisma.subject.count({ where: { semesterId } }),
            prisma.exam.count({ where: { semesterId } }),
        ]);

        if (subjectCount > 0 || examCount > 0) {
            const response: ApiResponse = {
                success: false,
                message: "Cannot delete semester due to existing linked records",
                error: `This semester has ${subjectCount} subject(s) and ${examCount} exam(s) linked. Please remove or reassign them before deleting the semester.`,
            };
            return res.status(409).json(response);
        }

        // 3. Perform the deletion (safe now)
        await prisma.semester.delete({ where: { id: semesterId } });

        const response: ApiResponse = {
            success: true,
            message: "Semester deleted successfully",
        };

        res.status(200).json(response);
    }
);
