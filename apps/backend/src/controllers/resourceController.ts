import { Request, Response } from "express";
import prisma from "@repo/db";
import { asyncHandler } from "../middleware/index";
import { ApiResponse } from "../types";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary";
import multer from "multer";

// Configure Multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        // Allow documents and images
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "image/jpeg",
            "image/png",
            "image/gif",
            "text/plain",
            "video/mp4",
            "video/webm",
            "audio/mpeg",
            "audio/wav",
            "audio/mp3",
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Invalid file type. Please upload documents, images, videos, or audio files."
                )
            );
        }
    },
});

// Type mapping between frontend and backend
const frontendToBackendTypeMap: Record<string, string> = {
    PDF: "NOTES",
    VIDEO: "VIDEO",
    AUDIO: "AUDIO",
    IMAGE: "REFERENCE",
    DOCUMENT: "NOTES",
    LINK: "LINK",
    OTHER: "OTHER",
};

const backendToFrontendTypeMap: Record<string, string> = {
    NOTES: "PDF",
    ASSIGNMENT: "DOCUMENT",
    SLIDES: "PDF",
    HANDOUT: "DOCUMENT",
    REFERENCE: "PDF",
    VIDEO: "VIDEO",
    AUDIO: "AUDIO",
    LINK: "LINK",
    ANNOUNCEMENT: "DOCUMENT",
    SYLLABUS: "DOCUMENT",
    OTHER: "OTHER",
};

// ===============================
// PROFESSOR RESOURCE MANAGEMENT
// ===============================

// Share a resource with students in a section
export const shareResource = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            professorId,
            sectionId,
            subjectId,
            title,
            description,
            resourceType,
            fileUrl,
            fileName,
            fileSize,
            mimeType,
            content,
            isPinned = false,
        } = req.body;
        const file = req.file; // Check if a file was uploaded

        try {
            // Verify professor has permission to create resources for this section
            const assignment =
                await prisma.professorSectionAssignment.findFirst({
                    where: {
                        professorId,
                        sectionId,
                        subjectId: subjectId || null,
                        isActive: true,
                        canCreateResources: true,
                    },
                });

            if (!assignment) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Professor does not have permission to create resources for this section/subject",
                });
            }

            // Verify section exists
            const section = await prisma.section.findUnique({
                where: { id: sectionId },
                include: {
                    course: true,
                    semester: true,
                },
            });

            if (!section) {
                return res.status(404).json({
                    success: false,
                    message: "Section not found",
                });
            }

            // If subject is specified, verify it exists and belongs to the same semester
            if (subjectId) {
                const subject = await prisma.subject.findUnique({
                    where: { id: subjectId },
                });

                if (!subject || subject.semesterId !== section.semesterId) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Subject not found or doesn't belong to this section's semester",
                    });
                }
            }

            let finalFileUrl = fileUrl;
            let finalFileName = fileName;
            let finalFileSize = fileSize;
            let finalMimeType = mimeType;
            let cloudinaryInfo = null;

            // If a file was uploaded, use Cloudinary
            if (file) {
                const uploadResult = await uploadToCloudinary(
                    file.buffer,
                    file.originalname,
                    "erp-professor-resources"
                );

                finalFileUrl = uploadResult.secure_url;
                finalFileName = file.originalname;
                finalFileSize = uploadResult.bytes;
                finalMimeType = file.mimetype;
                cloudinaryInfo = {
                    publicId: uploadResult.public_id,
                    url: uploadResult.secure_url,
                    bytes: uploadResult.bytes,
                    format: uploadResult.format,
                };
            }

            // Create the resource
            const resource = await prisma.sectionResource.create({
                data: {
                    title,
                    description,
                    resourceType: frontendToBackendTypeMap[resourceType] as any,
                    fileUrl: finalFileUrl,
                    fileName: finalFileName,
                    fileSize: finalFileSize || null,
                    mimeType: finalMimeType,
                    content,
                    sectionId,
                    subjectId: subjectId || null,
                    uploadedBy: professorId,
                    isPinned: isPinned === "true" || isPinned === true,
                    isVisible: true,
                    downloadCount: 0,
                },
                include: {
                    section: {
                        include: {
                            course: true,
                            semester: true,
                        },
                    },
                    subject: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    uploader: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            const responseData: any = {
                ...resource,
                type:
                    backendToFrontendTypeMap[resource.resourceType] ||
                    resource.resourceType,
                downloads: resource.downloadCount || 0,
                views: 0,
                uploadedBy: {
                    id: resource.uploader.id,
                    firstName: resource.uploader.name?.split(" ")[0] || "",
                    lastName:
                        resource.uploader.name?.split(" ").slice(1).join(" ") ||
                        "",
                    role: "PROFESSOR",
                },
                isPublic: resource.isVisible,
            };

            // Include Cloudinary info if file was uploaded
            if (cloudinaryInfo) {
                responseData.cloudinaryInfo = cloudinaryInfo;
            }

            res.status(201).json({
                success: true,
                message: file
                    ? "Resource shared successfully with file upload"
                    : "Resource shared successfully",
                data: responseData,
            });
        } catch (error) {
            console.error("Error sharing resource:", error);
            res.status(500).json({
                success: false,
                message: "Failed to share resource",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

// Share resource with file upload via Cloudinary
// Get resources for a section (Student view)
export const getResourcesForStudent = asyncHandler(
    async (req: Request, res: Response) => {
        const { studentId } = req.params;
        const { subjectId, resourceType, sectionId } = req.query;

        // Get student's section enrollments
        let whereClause: any = {
            isVisible: true,
        };

        if (sectionId) {
            // If specific section is requested, verify student is enrolled
            const sectionEnrollment = await prisma.sectionEnrollment.findFirst({
                where: {
                    studentId,
                    sectionId: sectionId as string,
                    status: "ACTIVE",
                },
            });

            if (!sectionEnrollment) {
                return res.status(403).json({
                    success: false,
                    message: "Student is not enrolled in this section",
                });
            }

            whereClause.sectionId = sectionId;
        } else {
            // Get all sections the student is enrolled in
            const enrollments = await prisma.sectionEnrollment.findMany({
                where: {
                    studentId,
                    status: "ACTIVE",
                },
                select: { sectionId: true },
            });

            if (enrollments.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student is not enrolled in any sections",
                });
            }

            whereClause.sectionId = {
                in: enrollments.map((e) => e.sectionId),
            };
        }

        if (subjectId) whereClause.subjectId = subjectId;
        if (resourceType) whereClause.resourceType = resourceType;

        const resources = await prisma.sectionResource.findMany({
            where: whereClause,
            include: {
                section: {
                    include: {
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
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        credits: true,
                    },
                },
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        });

        res.json({
            success: true,
            message: "Resources retrieved successfully",
            data: resources,
        });
    }
);

// Get resources for a section (Professor view)
export const getResourcesForProfessor = asyncHandler(
    async (req: Request, res: Response) => {
        const { professorId } = req.params;
        const { sectionId, subjectId, resourceType } = req.query;

        let whereClause: any = {};

        if (sectionId) {
            // Verify professor has access to this section
            const assignment =
                await prisma.professorSectionAssignment.findFirst({
                    where: {
                        professorId,
                        sectionId: sectionId as string,
                        isActive: true,
                    },
                });

            if (!assignment) {
                return res.status(403).json({
                    success: false,
                    message: "Professor does not have access to this section",
                });
            }

            whereClause.sectionId = sectionId;
        } else {
            // Get all sections the professor is assigned to
            const assignments =
                await prisma.professorSectionAssignment.findMany({
                    where: {
                        professorId,
                        isActive: true,
                    },
                    select: { sectionId: true },
                });

            if (assignments.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Professor is not assigned to any sections",
                });
            }

            whereClause.sectionId = {
                in: assignments.map((a) => a.sectionId),
            };
        }

        if (subjectId) whereClause.subjectId = subjectId;
        if (resourceType) whereClause.resourceType = resourceType;

        const resources = await prisma.sectionResource.findMany({
            where: whereClause,
            include: {
                section: {
                    include: {
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
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        credits: true,
                    },
                },
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        });

        // Transform the resources to match frontend types
        const transformedResources = resources.map((resource) => ({
            ...resource,
            type:
                backendToFrontendTypeMap[resource.resourceType] ||
                resource.resourceType,
            downloads: resource.downloadCount || 0,
            views: 0, // Add views field (not tracked yet in backend)
            uploadedBy: {
                id: resource.uploader.id,
                firstName: resource.uploader.name?.split(" ")[0] || "",
                lastName:
                    resource.uploader.name?.split(" ").slice(1).join(" ") || "",
                role: "PROFESSOR",
            },
            isPublic: resource.isVisible,
        }));

        res.json({
            success: true,
            message: "Resources retrieved successfully",
            data: transformedResources,
        });
    }
);

// Update resource
export const updateResource = asyncHandler(
    async (req: Request, res: Response) => {
        const { resourceId } = req.params;
        const { title, description, isPinned, isVisible } = req.body;

        const resource = await prisma.sectionResource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found",
            });
        }

        const updatedResource = await prisma.sectionResource.update({
            where: { id: resourceId },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(isPinned !== undefined && { isPinned }),
                ...(isVisible !== undefined && { isVisible }),
            },
            include: {
                section: {
                    include: {
                        course: true,
                        semester: true,
                    },
                },
                subject: true,
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        const transformedResource = {
            ...updatedResource,
            type:
                backendToFrontendTypeMap[updatedResource.resourceType] ||
                updatedResource.resourceType,
            downloads: updatedResource.downloadCount || 0,
            views: 0,
            uploadedBy: {
                id: updatedResource.uploader.id,
                firstName: updatedResource.uploader.name?.split(" ")[0] || "",
                lastName:
                    updatedResource.uploader.name
                        ?.split(" ")
                        .slice(1)
                        .join(" ") || "",
                role: "PROFESSOR",
            },
            isPublic: updatedResource.isVisible,
        };

        res.json({
            success: true,
            message: "Resource updated successfully",
            data: transformedResource,
        });
    }
);

// Delete resource
export const deleteResource = asyncHandler(
    async (req: Request, res: Response) => {
        const { resourceId } = req.params;
        const { professorId } = req.body;

        const resource = await prisma.sectionResource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found",
            });
        }

        // Verify the professor owns this resource or has admin access
        if (resource.uploadedBy !== professorId) {
            return res.status(403).json({
                success: false,
                message: "Only the resource owner can delete this resource",
            });
        }

        await prisma.sectionResource.delete({
            where: { id: resourceId },
        });

        res.json({
            success: true,
            message: "Resource deleted successfully",
        });
    }
);

// Track resource download
export const trackResourceDownload = asyncHandler(
    async (req: Request, res: Response) => {
        const { resourceId } = req.params;

        const resource = await prisma.sectionResource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found",
            });
        }

        await prisma.sectionResource.update({
            where: { id: resourceId },
            data: {
                downloadCount: {
                    increment: 1,
                },
            },
        });

        res.json({
            success: true,
            message: "Download tracked successfully",
        });
    }
);

// Get resource statistics for professor
export const getResourceStats = asyncHandler(
    async (req: Request, res: Response) => {
        const { professorId } = req.params;
        const { sectionId, subjectId } = req.query;

        let whereClause: any = {
            uploadedBy: professorId,
        };

        if (sectionId) whereClause.sectionId = sectionId;
        if (subjectId) whereClause.subjectId = subjectId;

        const stats = await prisma.sectionResource.groupBy({
            by: ["resourceType"],
            where: whereClause,
            _count: {
                _all: true,
            },
            _sum: {
                downloadCount: true,
            },
        });

        const totalResources = await prisma.sectionResource.count({
            where: whereClause,
        });

        const totalDownloads = await prisma.sectionResource.aggregate({
            where: whereClause,
            _sum: {
                downloadCount: true,
            },
        });

        const transformedStats = stats.map((stat) => ({
            type:
                backendToFrontendTypeMap[stat.resourceType] ||
                stat.resourceType,
            count: stat._count._all,
            totalDownloads: stat._sum.downloadCount || 0,
        }));

        res.json({
            success: true,
            message: "Resource statistics retrieved successfully",
            data: {
                totalResources,
                totalDownloads: totalDownloads._sum.downloadCount || 0,
                totalViews: 0, // Add this field for compatibility with frontend
                resourcesByType: transformedStats || [],
            },
        });
    }
);
