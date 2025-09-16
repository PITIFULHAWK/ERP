import { Request, Response } from "express";
import prisma from "@repo/db";
import { asyncHandler } from "../middleware/index";
import { ApiResponse } from "../types";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary";
import multer from "multer";

// Extend the Express Request type to include the user property
interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

// Configure Multer for timetable file uploads
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        // Allow timetable document formats
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
            "image/gif",
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Invalid file type. Please upload PDF, Word document, or image files."
                )
            );
        }
    },
});

// Get timetable for a specific section
export const getSectionTimetable = asyncHandler(
    async (req: Request, res: Response) => {
        const { sectionId } = req.params;

        try {
            // Find existing timetable resource for the section
            const timetableResource = await prisma.sectionResource.findFirst({
                where: {
                    sectionId,
                    resourceType: "TIMETABLE",
                },
                include: {
                    section: {
                        include: {
                            course: true,
                            semester: true,
                            academicYear: true,
                            professorAssignments: {
                                include: {
                                    professor: true,
                                    subject: true,
                                },
                            },
                        },
                    },
                    uploader: true,
                },
            });

            if (!timetableResource) {
                return res.status(404).json({
                    success: false,
                    message: "No timetable found for this section",
                } as ApiResponse);
            }

            res.json({
                success: true,
                data: {
                    id: timetableResource.id,
                    title: timetableResource.title,
                    description: timetableResource.description,
                    fileUrl: timetableResource.fileUrl,
                    fileName: timetableResource.fileName,
                    fileSize: timetableResource.fileSize,
                    mimeType: timetableResource.mimeType,
                    section: timetableResource.section,
                    uploadedBy: timetableResource.uploader,
                    createdAt: timetableResource.createdAt,
                    updatedAt: timetableResource.updatedAt,
                },
            } as ApiResponse);
        } catch (error) {
            console.error("Error fetching section timetable:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch section timetable",
            } as ApiResponse);
        }
    }
);

// Create or update timetable for a section
export const uploadTimetable = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        const { sectionId } = req.params;
        const { academicYearId, description } = req.body;
        const file = req.file;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            } as ApiResponse);
        }

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a timetable file",
            } as ApiResponse);
        }

        try {
            // Validate section exists
            const section = await prisma.section.findUnique({
                where: { id: sectionId },
                include: {
                    course: true,
                    semester: true,
                    academicYear: true,
                },
            });

            if (!section) {
                return res.status(404).json({
                    success: false,
                    message: "Section not found",
                } as ApiResponse);
            }

            // Validate academic year if provided
            if (academicYearId) {
                const academicYear = await prisma.academicYear.findUnique({
                    where: { id: academicYearId },
                });

                if (!academicYear) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid academic year",
                    } as ApiResponse);
                }
            }

            // Check if timetable already exists
            const existingTimetable = await prisma.sectionResource.findFirst({
                where: {
                    sectionId,
                    resourceType: "TIMETABLE",
                },
            });

            // Delete old file from Cloudinary if updating
            if (existingTimetable && existingTimetable.fileUrl) {
                try {
                    // Extract public_id from Cloudinary URL
                    const urlParts = existingTimetable.fileUrl.split("/");
                    const fileNameWithExt = urlParts[urlParts.length - 1];
                    const publicId = fileNameWithExt.split(".")[0];
                    await deleteFromCloudinary(publicId);
                } catch (error) {
                    console.error(
                        "Error deleting old file from Cloudinary:",
                        error
                    );
                }
            }

            // Upload new file to Cloudinary
            const uploadResult = await uploadToCloudinary(
                file.buffer,
                file.originalname,
                "timetables"
            );

            let timetableResource;

            if (existingTimetable) {
                // Update existing timetable
                timetableResource = await prisma.sectionResource.update({
                    where: { id: existingTimetable.id },
                    data: {
                        title: `Timetable - ${section.course.name} ${section.name}`,
                        description:
                            description ||
                            `Timetable for ${section.course.name} - ${section.name}`,
                        fileUrl: uploadResult.secure_url,
                        fileName: file.originalname,
                        fileSize: file.size,
                        mimeType: file.mimetype,
                        updatedAt: new Date(),
                    },
                    include: {
                        section: {
                            include: {
                                course: true,
                                semester: true,
                                academicYear: true,
                            },
                        },
                        uploader: true,
                    },
                });
            } else {
                // Create new timetable
                timetableResource = await prisma.sectionResource.create({
                    data: {
                        title: `Timetable - ${section.course.name} ${section.name}`,
                        description:
                            description ||
                            `Timetable for ${section.course.name} - ${section.name}`,
                        resourceType: "TIMETABLE",
                        fileUrl: uploadResult.secure_url,
                        fileName: file.originalname,
                        fileSize: file.size,
                        mimeType: file.mimetype,
                        sectionId,
                        uploadedBy: userId,
                        isPinned: true, // Pin timetables by default
                    },
                    include: {
                        section: {
                            include: {
                                course: true,
                                semester: true,
                                academicYear: true,
                            },
                        },
                        uploader: true,
                    },
                });
            }

            res.json({
                success: true,
                message: existingTimetable
                    ? "Timetable updated successfully"
                    : "Timetable uploaded successfully",
                data: {
                    id: timetableResource.id,
                    title: timetableResource.title,
                    description: timetableResource.description,
                    fileUrl: timetableResource.fileUrl,
                    fileName: timetableResource.fileName,
                    fileSize: timetableResource.fileSize,
                    mimeType: timetableResource.mimeType,
                    section: timetableResource.section,
                    uploadedBy: timetableResource.uploader,
                    createdAt: timetableResource.createdAt,
                    updatedAt: timetableResource.updatedAt,
                },
            } as ApiResponse);
        } catch (error) {
            console.error("Error uploading timetable:", error);
            res.status(500).json({
                success: false,
                message: "Failed to upload timetable",
            } as ApiResponse);
        }
    }
);

// Delete timetable for a section
export const deleteTimetable = asyncHandler(
    async (req: Request, res: Response) => {
        const { sectionId } = req.params;

        try {
            // Find and delete timetable resource
            const timetableResource = await prisma.sectionResource.findFirst({
                where: {
                    sectionId,
                    resourceType: "TIMETABLE",
                },
            });

            if (!timetableResource) {
                return res.status(404).json({
                    success: false,
                    message: "No timetable found for this section",
                } as ApiResponse);
            }

            // Delete file from Cloudinary if it exists
            if (timetableResource.fileUrl) {
                try {
                    // Extract public_id from Cloudinary URL
                    const urlParts = timetableResource.fileUrl.split("/");
                    const fileNameWithExt = urlParts[urlParts.length - 1];
                    const publicId = fileNameWithExt.split(".")[0];
                    await deleteFromCloudinary(publicId);
                } catch (error) {
                    console.error(
                        "Error deleting file from Cloudinary:",
                        error
                    );
                }
            }

            await prisma.sectionResource.delete({
                where: { id: timetableResource.id },
            });

            res.json({
                success: true,
                message: "Timetable deleted successfully",
            } as ApiResponse);
        } catch (error) {
            console.error("Error deleting timetable:", error);
            res.status(500).json({
                success: false,
                message: "Failed to delete timetable",
            } as ApiResponse);
        }
    }
);

// Get all sections with timetables (for admin overview)
export const getAllSectionTimetables = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const timetableResources = await prisma.sectionResource.findMany({
                where: {
                    resourceType: "TIMETABLE",
                },
                include: {
                    section: {
                        include: {
                            course: true,
                            semester: true,
                            academicYear: true,
                            professorAssignments: {
                                include: {
                                    professor: true,
                                    subject: true,
                                },
                            },
                        },
                    },
                    uploader: true,
                },
                orderBy: [
                    { section: { course: { name: "asc" } } },
                    { section: { name: "asc" } },
                ],
            });

            const timetables = timetableResources.map((resource) => ({
                id: resource.id,
                title: resource.title,
                description: resource.description,
                fileUrl: resource.fileUrl,
                fileName: resource.fileName,
                fileSize: resource.fileSize,
                mimeType: resource.mimeType,
                section: resource.section,
                uploadedBy: resource.uploader,
                createdAt: resource.createdAt,
                updatedAt: resource.updatedAt,
            }));

            res.json({
                success: true,
                data: timetables,
            } as ApiResponse);
        } catch (error) {
            console.error("Error fetching all timetables:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch timetables",
            } as ApiResponse);
        }
    }
);

// Get all academic years for dropdown
export const getAcademicYears = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const academicYears = await prisma.academicYear.findMany({
                orderBy: {
                    year: "desc",
                },
            });

            res.json({
                success: true,
                data: academicYears,
            } as ApiResponse);
        } catch (error) {
            console.error("Error fetching academic years:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch academic years",
            } as ApiResponse);
        }
    }
);
