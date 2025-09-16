import { Request, Response } from "express";
import { asyncHandler } from "../middleware/index";
import prisma from "@repo/db";
import { ApiResponse } from "../types";

// Get all academic years
export const getAcademicYears = asyncHandler(
    async (req: Request, res: Response) => {
        const { universityId } = req.query;

        const academicYears = await prisma.academicYear.findMany({
            where: {
                ...(universityId && { universityId: universityId as string }),
            },
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                        uid: true,
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                        sections: true,
                        liveClasses: true,
                    },
                },
            },
            orderBy: {
                startDate: "desc",
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Academic years retrieved successfully",
            data: academicYears,
        };

        res.json(response);
    }
);

// Get a single academic year by ID
export const getAcademicYear = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const academicYear = await prisma.academicYear.findUnique({
            where: { id },
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                        uid: true,
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                        sections: true,
                        liveClasses: true,
                        attendances: true,
                    },
                },
            },
        });

        if (!academicYear) {
            return res.status(404).json({
                success: false,
                message: "Academic year not found",
            });
        }

        const response: ApiResponse = {
            success: true,
            message: "Academic year retrieved successfully",
            data: academicYear,
        };

        res.json(response);
    }
);

// Create a new academic year
export const createAcademicYear = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            year,
            startDate,
            endDate,
            isActive,
            universityId,
            calendarPdfUrl,
            calendarPdfName,
        } = req.body;

        // Validation
        if (!year || !startDate || !endDate || !universityId) {
            return res.status(400).json({
                success: false,
                message:
                    "Year, startDate, endDate, and universityId are required",
            });
        }

        // Check if university exists
        const university = await prisma.university.findUnique({
            where: { id: universityId },
        });

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found",
            });
        }

        // Check if academic year already exists for this university
        const existingAcademicYear = await prisma.academicYear.findFirst({
            where: {
                year,
                universityId,
            },
        });

        if (existingAcademicYear) {
            return res.status(400).json({
                success: false,
                message: "Academic year already exists for this university",
            });
        }

        // If this academic year is set to active, deactivate all other academic years for this university
        if (isActive) {
            await prisma.academicYear.updateMany({
                where: { universityId },
                data: { isActive: false },
            });
        }

        const academicYear = await prisma.academicYear.create({
            data: {
                year,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive: isActive || false,
                universityId,
                calendarPdfUrl: calendarPdfUrl || null,
                calendarPdfName: calendarPdfName || null,
                calendarUploadedAt: calendarPdfUrl ? new Date() : null,
            },
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                        uid: true,
                    },
                },
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Academic year created successfully",
            data: academicYear,
        };

        res.status(201).json(response);
    }
);

// Update an academic year
export const updateAcademicYear = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const {
            year,
            startDate,
            endDate,
            isActive,
            calendarPdfUrl,
            calendarPdfName,
        } = req.body;

        const existingAcademicYear = await prisma.academicYear.findUnique({
            where: { id },
        });

        if (!existingAcademicYear) {
            return res.status(404).json({
                success: false,
                message: "Academic year not found",
            });
        }

        // If setting this academic year to active, deactivate all others for this university
        if (isActive && !existingAcademicYear.isActive) {
            await prisma.academicYear.updateMany({
                where: {
                    universityId: existingAcademicYear.universityId,
                    id: { not: id },
                },
                data: { isActive: false },
            });
        }

        const academicYear = await prisma.academicYear.update({
            where: { id },
            data: {
                ...(year && { year }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
                ...(isActive !== undefined && { isActive }),
                ...(calendarPdfUrl !== undefined && { calendarPdfUrl }),
                ...(calendarPdfName !== undefined && { calendarPdfName }),
                ...(calendarPdfUrl && { calendarUploadedAt: new Date() }),
            },
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                        uid: true,
                    },
                },
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Academic year updated successfully",
            data: academicYear,
        };

        res.json(response);
    }
);

// Delete an academic year
export const deleteAcademicYear = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const academicYear = await prisma.academicYear.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        enrollments: true,
                        sections: true,
                        liveClasses: true,
                        attendances: true,
                    },
                },
            },
        });

        if (!academicYear) {
            return res.status(404).json({
                success: false,
                message: "Academic year not found",
            });
        }

        // Check if academic year has related data
        const hasRelatedData =
            academicYear._count.enrollments > 0 ||
            academicYear._count.sections > 0 ||
            academicYear._count.liveClasses > 0 ||
            academicYear._count.attendances > 0;

        if (hasRelatedData) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot delete academic year with existing enrollments, sections, classes, or attendance records",
            });
        }

        await prisma.academicYear.delete({
            where: { id },
        });

        const response: ApiResponse = {
            success: true,
            message: "Academic year deleted successfully",
        };

        res.json(response);
    }
);

// Set academic year as active (deactivates all others for the university)
export const setActiveAcademicYear = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const academicYear = await prisma.academicYear.findUnique({
            where: { id },
        });

        if (!academicYear) {
            return res.status(404).json({
                success: false,
                message: "Academic year not found",
            });
        }

        // Deactivate all other academic years for this university
        await prisma.academicYear.updateMany({
            where: {
                universityId: academicYear.universityId,
                id: { not: id },
            },
            data: { isActive: false },
        });

        // Activate this academic year
        const updatedAcademicYear = await prisma.academicYear.update({
            where: { id },
            data: { isActive: true },
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                        uid: true,
                    },
                },
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Academic year set as active successfully",
            data: updatedAcademicYear,
        };

        res.json(response);
    }
);

// Get active academic year for a university
export const getActiveAcademicYear = asyncHandler(
    async (req: Request, res: Response) => {
        const { universityId } = req.params;

        const activeAcademicYear = await prisma.academicYear.findFirst({
            where: {
                universityId,
                isActive: true,
            },
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                        uid: true,
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                        sections: true,
                        liveClasses: true,
                    },
                },
            },
        });

        if (!activeAcademicYear) {
            return res.status(404).json({
                success: false,
                message: "No active academic year found for this university",
            });
        }

        const response: ApiResponse = {
            success: true,
            message: "Active academic year retrieved successfully",
            data: activeAcademicYear,
        };

        res.json(response);
    }
);
