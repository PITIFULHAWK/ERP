import { Request, Response } from "express";
import prisma from "@repo/db";
import { asyncHandler } from "../middleware/index";
import { ApiResponse } from "../types";

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

        // Verify professor has permission to create resources for this section
        const assignment = await prisma.professorSectionAssignment.findFirst({
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

        // Create the resource
        const resource = await prisma.sectionResource.create({
            data: {
                title,
                description,
                resourceType: resourceType as any,
                fileUrl,
                fileName,
                fileSize: fileSize || null,
                mimeType,
                content,
                sectionId,
                subjectId: subjectId || null,
                uploadedBy: professorId,
                isPinned,
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

        res.status(201).json({
            success: true,
            message: "Resource shared successfully",
            data: resource,
        });
    }
);

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

        res.json({
            success: true,
            message: "Resources retrieved successfully",
            data: resources,
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

        res.json({
            success: true,
            message: "Resource updated successfully",
            data: updatedResource,
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

        res.json({
            success: true,
            message: "Resource statistics retrieved successfully",
            data: {
                totalResources,
                totalDownloads: totalDownloads._sum.downloadCount || 0,
                byResourceType: stats,
            },
        });
    }
);
