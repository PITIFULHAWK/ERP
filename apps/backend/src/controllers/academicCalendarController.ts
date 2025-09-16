import { Request, Response } from "express";
import prisma from "@repo/db";
import { asyncHandler } from "../middleware/index";
import { ApiResponse } from "../types";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary";
import multer from "multer";

// Configure Multer for academic calendar PDF uploads
const storage = multer.memoryStorage();
export const uploadCalendar = multer({
    storage,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB for PDFs
    },
    fileFilter: (req, file, cb) => {
        // Only allow PDF files for academic calendar
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only PDF files are allowed for academic calendar upload."
                )
            );
        }
    },
});

// Upload academic calendar PDF
export const uploadCalendarPDF = asyncHandler(
    async (req: Request, res: Response) => {
        const { academicYearId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No PDF file provided",
            });
        }

        if (!academicYearId) {
            return res.status(400).json({
                success: false,
                message: "Academic year ID is required",
            });
        }

        try {
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

            // Delete old calendar PDF from Cloudinary if it exists
            if (academicYear.calendarCloudinaryPublicId) {
                try {
                    await deleteFromCloudinary(
                        academicYear.calendarCloudinaryPublicId
                    );
                } catch (error) {
                    console.error("Error deleting old calendar PDF:", error);
                    // Continue with upload even if delete fails
                }
            }

            // Upload new PDF to Cloudinary
            const uploadResult = await uploadToCloudinary(
                file.buffer,
                file.originalname,
                "erp-academic-calendars"
            );

            // Update academic year with calendar PDF
            const updatedAcademicYear = await prisma.academicYear.update({
                where: { id: academicYearId },
                data: {
                    calendarPdfUrl: uploadResult.secure_url,
                    calendarPdfName: file.originalname,
                    calendarCloudinaryPublicId: uploadResult.public_id,
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
                data: {
                    ...updatedAcademicYear,
                    fileSize: uploadResult.bytes,
                },
            };

            res.json(response);
        } catch (error) {
            console.error("Error uploading calendar PDF:", error);
            res.status(500).json({
                success: false,
                message: "Failed to upload calendar PDF",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
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

        try {
            const academicYear = await prisma.academicYear.findUnique({
                where: { id: academicYearId },
            });

            if (!academicYear) {
                return res.status(404).json({
                    success: false,
                    message: "Academic year not found",
                });
            }

            // Delete file from Cloudinary if it exists
            if (academicYear.calendarCloudinaryPublicId) {
                try {
                    await deleteFromCloudinary(
                        academicYear.calendarCloudinaryPublicId
                    );
                } catch (error) {
                    console.error(
                        "Error deleting calendar PDF from Cloudinary:",
                        error
                    );
                    // Continue with database cleanup even if Cloudinary delete fails
                }
            }

            // Remove calendar PDF from academic year
            const updatedAcademicYear = await prisma.academicYear.update({
                where: { id: academicYearId },
                data: {
                    calendarPdfUrl: null,
                    calendarPdfName: null,
                    calendarCloudinaryPublicId: null,
                    calendarUploadedAt: null,
                },
            });

            const response: ApiResponse = {
                success: true,
                message: "Academic calendar PDF removed successfully",
                data: updatedAcademicYear,
            };

            res.json(response);
        } catch (error) {
            console.error("Error removing calendar PDF:", error);
            res.status(500).json({
                success: false,
                message: "Failed to remove calendar PDF",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
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
