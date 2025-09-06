import { Request, Response } from "express";
import { asyncHandler } from "../middleware/index";
import prisma from "@repo/db";
import { ApiResponse } from "../types";

export const createSemester = asyncHandler(
    async (req: Request, res: Response) => {
        const { courseId, number } = req.body;

        // 1. Check if the course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                semester: true, // Include existing semesters for validation
            },
        });

        if (!course) {
            const response: ApiResponse = {
                success: false,
                message: "Course not found",
                error: `Course with ID ${courseId} does not exist.`,
            };
            return res.status(404).json(response);
        }

        // 2. Check if the semester number exceeds the total semesters for the course
        if (number > course.totalSemester) {
            const response: ApiResponse = {
                success: false,
                message: "Invalid semester number",
                error: `Semester number ${number} exceeds the total of ${course.totalSemester} semesters for this course.`,
            };
            return res.status(400).json(response);
        }

        const newSemester = await prisma.semester.create({
            data: {
                number,
                course: {
                    connect: {
                        id: courseId,
                    },
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
            data: semesters,
        };

        res.status(200).json(response);
    }
);

export const updateSemester = asyncHandler(
    async (req: Request, res: Response) => {
        const { semesterId } = req.params;
        const { number } = req.body;

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

        // 2. Validate the new semester number
        if (number > semester.course.totalSemester) {
            const response: ApiResponse = {
                success: false,
                message: "Invalid semester number",
                error: `Semester number ${number} exceeds the total of ${semester.course.totalSemester} for this course.`,
            };
            return res.status(400).json(response);
        }

        // 3. Perform the update
        const updatedSemester = await prisma.semester.update({
            where: { id: semesterId },
            data: { number },
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

        // 2. Perform the deletion
        // Note: This will fail if there are any subjects or exams linked to this semester.
        // This is the default restrictive behavior to protect data integrity.
        await prisma.semester.delete({
            where: { id: semesterId },
        });

        const response: ApiResponse = {
            success: true,
            message: "Semester deleted successfully",
        };

        res.status(200).json(response);
    }
);