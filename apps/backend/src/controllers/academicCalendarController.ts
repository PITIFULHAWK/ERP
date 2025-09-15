import { Request, Response } from "express";
import prisma from "@repo/db";
import { asyncHandler } from "../middleware/index";
import { ApiResponse } from "../types";

// Upload academic calendar PDF
export const uploadCalendarPDF = asyncHandler(
    async (req: Request, res: Response) => {
        const { academicYearId, calendarPdfUrl, calendarPdfName } = req.body;

        // Verify academic year exists
        const academicYear = await prisma.academicYear.findUnique({
            where: { id: academicYearId },
        });

        if (!academicYear) {
            return res.status(404).json({
                success: false,
                message: "Academic year not found",
            });
        }

        // Update academic year with calendar PDF
        const updatedAcademicYear = await prisma.academicYear.update({
            where: { id: academicYearId },
            data: {
                calendarPdfUrl,
                calendarPdfName,
                calendarUploadedAt: new Date(),
            },
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Academic calendar PDF uploaded successfully",
            data: updatedAcademicYear,
        };

        res.json(response);
    }
);

// Get academic calendar PDF
export const getCalendarPDF = asyncHandler(
    async (req: Request, res: Response) => {
        const { academicYearId } = req.params;

        const academicYear = await prisma.academicYear.findUnique({
            where: { id: academicYearId },
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
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
            message: "Academic calendar retrieved successfully",
            data: {
                id: academicYear.id,
                year: academicYear.year,
                startDate: academicYear.startDate,
                endDate: academicYear.endDate,
                isActive: academicYear.isActive,
                university: academicYear.university,
                calendarPdfUrl: academicYear.calendarPdfUrl,
                calendarPdfName: academicYear.calendarPdfName,
                calendarUploadedAt: academicYear.calendarUploadedAt,
            },
        };

        res.json(response);
    }
);

// Get academic calendar for student (based on their enrollments)
export const getStudentCalendar = asyncHandler(
    async (req: Request, res: Response) => {
        const { studentId } = req.params;

        // Get student's enrollments to find their academic years
        const enrollments = await prisma.studentEnrollment.findMany({
            where: {
                studentId,
                status: "ACTIVE",
            },
            include: {
                academicYear: {
                    include: {
                        university: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                course: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                semester: {
                    select: {
                        id: true,
                        number: true,
                        code: true,
                    },
                },
            },
        });

        if (enrollments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active enrollments found for this student",
            });
        }

        // Extract unique academic years
        const academicYears = enrollments.reduce((acc, enrollment) => {
            const existingYear = acc.find(
                (year) => year.id === enrollment.academicYear.id
            );
            if (!existingYear) {
                acc.push({
                    ...enrollment.academicYear,
                    enrollments: [enrollment],
                });
            } else {
                existingYear.enrollments.push(enrollment);
            }
            return acc;
        }, [] as any[]);

        const response: ApiResponse = {
            success: true,
            message: "Student academic calendars retrieved successfully",
            data: academicYears,
        };

        res.json(response);
    }
);

// Remove academic calendar PDF
export const removeCalendarPDF = asyncHandler(
    async (req: Request, res: Response) => {
        const { academicYearId } = req.params;

        const academicYear = await prisma.academicYear.findUnique({
            where: { id: academicYearId },
        });

        if (!academicYear) {
            return res.status(404).json({
                success: false,
                message: "Academic year not found",
            });
        }

        // Remove calendar PDF from academic year
        const updatedAcademicYear = await prisma.academicYear.update({
            where: { id: academicYearId },
            data: {
                calendarPdfUrl: null,
                calendarPdfName: null,
                calendarUploadedAt: null,
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Academic calendar PDF removed successfully",
            data: updatedAcademicYear,
        };

        res.json(response);
    }
);

// Get all academic years with calendar status
export const getAcademicYearsWithCalendar = asyncHandler(
    async (req: Request, res: Response) => {
        const { universityId } = req.query;

        let whereClause: any = {};
        if (universityId) {
            whereClause.universityId = universityId;
        }

        const academicYears = await prisma.academicYear.findMany({
            where: whereClause,
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                        sections: true,
                    },
                },
            },
            orderBy: [{ isActive: "desc" }, { year: "desc" }],
        });

        const response: ApiResponse = {
            success: true,
            message: "Academic years retrieved successfully",
            data: academicYears.map((year) => ({
                ...year,
                hasCalendarPDF: !!year.calendarPdfUrl,
            })),
        };

        res.json(response);
    }
);
