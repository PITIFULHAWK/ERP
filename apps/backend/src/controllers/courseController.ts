import { Request, Response } from "express";
import prisma from "@repo/db";
import { CreateCourseRequest, ApiResponse } from "../types";
import { asyncHandler } from "../middleware";

// Get all courses
export const getCourses = asyncHandler(async (req: Request, res: Response) => {
    const { universityId } = req.query;

    const courses = await prisma.course.findMany({
        where: universityId ? { universityId: universityId as string } : {},
        include: {
            university: true,
            _count: {
                select: {
                    users: true,
                    applications: true,
                },
            },
        },
    });

    const response: ApiResponse = {
        success: true,
        message: "Courses retrieved successfully",
        data: courses,
    };

    res.json(response);
});

// Get course by ID
export const getCourseById = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                university: true,
                users: true,
                applications: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!course) {
            const response: ApiResponse = {
                success: false,
                message: "Course not found",
                error: "Not Found",
            };
            return res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: true,
            message: "Course retrieved successfully",
            data: course,
        };

        res.json(response);
    }
);

// Create course (Admin only)
export const createCourse = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            name,
            code,
            credits,
            totalSemester,
            totalFees,
            universityId,
        }: CreateCourseRequest = req.body;

        // Check if course with same code exists
        const existingCourse = await prisma.course.findUnique({
            where: { code },
        });

        if (existingCourse) {
            const response: ApiResponse = {
                success: false,
                message: "Course with this code already exists",
                error: "Conflict",
            };
            return res.status(409).json(response);
        }

        const course = await prisma.course.create({
            data: {
                name,
                code,
                credits,
                totalSemester,
                totalFees,
                universityId,
            },
            include: {
                university: true,
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Course created successfully",
            data: course,
        };

        res.status(201).json(response);
    }
);

// Update course (Admin only)
export const updateCourse = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const updateData = req.body;

        const course = await prisma.course.update({
            where: { id },
            data: updateData,
            include: {
                university: true,
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Course updated successfully",
            data: course,
        };

        res.json(response);
    }
);

// Delete course (Admin only)
export const deleteCourse = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        await prisma.course.delete({
            where: { id },
        });

        const response: ApiResponse = {
            success: true,
            message: "Course deleted successfully",
        };

        res.json(response);
    }
);
