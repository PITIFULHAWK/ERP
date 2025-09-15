import { Request, Response } from "express";
import prisma from "@repo/db";
import { asyncHandler } from "../middleware/index";

// Create a new complaint (Students only)
export const createComplaint = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            title,
            description,
            category,
            priority = "MEDIUM",
            location,
            urgency = false,
            attachmentUrls = [],
        } = req.body;

        const studentId = (req as any).user?.id;
        const userRole = (req as any).user?.role;

        // Only students can create complaints
        if (userRole !== "STUDENT") {
            return res.status(403).json({
                success: false,
                message: "Only students can raise complaints",
            });
        }

        const complaint = await prisma.complaint.create({
            data: {
                title,
                description,
                category,
                priority,
                studentId,
                location,
                urgency,
                attachmentUrls,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Create initial update record
        await prisma.complaintUpdate.create({
            data: {
                complaintId: complaint.id,
                updatedBy: studentId,
                updateType: "COMMENT",
                message: "Complaint raised",
                isInternal: false,
            },
        });

        res.status(201).json({
            success: true,
            message: "Complaint raised successfully",
            data: complaint,
        });
    }
);

// Get all complaints with filtering (Admin/Staff) or user's own complaints (Student)
export const getComplaints = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.role;
        const {
            status,
            category,
            priority,
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        // Build where clause based on user role
        let whereClause: any = {};

        if (userRole === "STUDENT") {
            // Students can only see their own complaints
            whereClause.studentId = userId;
        }
        // Admin/Staff can see all complaints - no additional filter needed

        // Add filters if provided
        if (status) whereClause.status = status;
        if (category) whereClause.category = category;
        if (priority) whereClause.priority = priority;

        const [complaints, totalCount] = await Promise.all([
            prisma.complaint.findMany({
                where: whereClause,
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    resolver: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    assignedAdmin: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            updates: true,
                        },
                    },
                },
                orderBy: {
                    [sortBy as string]: sortOrder,
                },
                skip,
                take: Number(limit),
            }),
            prisma.complaint.count({ where: whereClause }),
        ]);

        res.json({
            success: true,
            message: "Complaints retrieved successfully",
            data: {
                complaints,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalCount / Number(limit)),
                    totalCount,
                    hasNextPage: skip + Number(limit) < totalCount,
                    hasPrevPage: Number(page) > 1,
                },
            },
        });
    }
);

// Get complaint by ID
export const getComplaintById = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.role;

        const complaint = await prisma.complaint.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                resolver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedAdmin: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                updates: {
                    include: {
                        updater: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    where: userRole === "STUDENT" ? { isInternal: false } : {},
                },
            },
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        // Students can only view their own complaints
        if (userRole === "STUDENT" && complaint.studentId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only view your own complaints",
            });
        }

        res.json({
            success: true,
            message: "Complaint retrieved successfully",
            data: complaint,
        });
    }
);

// Update complaint status (Admin/Staff only)
export const updateComplaintStatus = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const { status, resolutionNote, assignedTo } = req.body;
        const adminId = (req as any).user?.id;
        const userRole = (req as any).user?.role;

        // Only admin/staff can update complaint status
        if (userRole !== "ADMIN" && userRole !== "PROFESSOR") {
            return res.status(403).json({
                success: false,
                message: "Only admin/staff can update complaint status",
            });
        }

        const complaint = await prisma.complaint.findUnique({
            where: { id },
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        const updateData: any = {
            status,
            updatedAt: new Date(),
        };

        // If resolving the complaint
        if (status === "RESOLVED" || status === "CLOSED") {
            updateData.resolvedAt = new Date();
            updateData.resolvedBy = adminId;
            if (resolutionNote) {
                updateData.resolutionNote = resolutionNote;
            }
        }

        // If assigning the complaint
        if (assignedTo) {
            updateData.assignedTo = assignedTo;
        }

        const updatedComplaint = await prisma.complaint.update({
            where: { id },
            data: updateData,
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                resolver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedAdmin: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Create update record
        await prisma.complaintUpdate.create({
            data: {
                complaintId: id,
                updatedBy: adminId,
                updateType: assignedTo ? "ASSIGNMENT" : status === "RESOLVED" || status === "CLOSED" ? "RESOLUTION" : "STATUS_CHANGE",
                message: resolutionNote || `Status changed to ${status}${assignedTo ? ` and assigned to admin` : ""}`,
                isInternal: false,
            },
        });

        res.json({
            success: true,
            message: "Complaint updated successfully",
            data: updatedComplaint,
        });
    }
);

// Add comment/update to complaint
export const addComplaintUpdate = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const { message, isInternal = false } = req.body;
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.role;

        const complaint = await prisma.complaint.findUnique({
            where: { id },
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        // Students can only comment on their own complaints and cannot make internal comments
        if (userRole === "STUDENT") {
            if (complaint.studentId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: "You can only comment on your own complaints",
                });
            }
            if (isInternal) {
                return res.status(403).json({
                    success: false,
                    message: "Students cannot make internal comments",
                });
            }
        }

        const update = await prisma.complaintUpdate.create({
            data: {
                complaintId: id,
                updatedBy: userId,
                updateType: "COMMENT",
                message,
                isInternal: userRole !== "STUDENT" ? isInternal : false,
            },
            include: {
                updater: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: update,
        });
    }
);

// Get complaint statistics (Admin only)
export const getComplaintStats = asyncHandler(
    async (req: Request, res: Response) => {
        const userRole = (req as any).user?.role;

        if (userRole !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Only admins can view complaint statistics",
            });
        }

        const [
            totalComplaints,
            openComplaints,
            resolvedComplaints,
            categoryCounts,
            priorityCounts,
            recentComplaints,
        ] = await Promise.all([
            prisma.complaint.count(),
            prisma.complaint.count({ where: { status: "OPEN" } }),
            prisma.complaint.count({ where: { status: "RESOLVED" } }),
            prisma.complaint.groupBy({
                by: ["category"],
                _count: { id: true },
            }),
            prisma.complaint.groupBy({
                by: ["priority"],
                _count: { id: true },
            }),
            prisma.complaint.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    student: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
        ]);

        res.json({
            success: true,
            message: "Complaint statistics retrieved successfully",
            data: {
                overview: {
                    total: totalComplaints,
                    open: openComplaints,
                    resolved: resolvedComplaints,
                    inProgress: await prisma.complaint.count({
                        where: { status: "IN_PROGRESS" },
                    }),
                },
                byCategory: categoryCounts,
                byPriority: priorityCounts,
                recentComplaints,
            },
        });
    }
);

// Delete complaint (Admin only - soft delete by changing status)
export const deleteComplaint = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const userRole = (req as any).user?.role;
        const adminId = (req as any).user?.id;

        if (userRole !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Only admins can delete complaints",
            });
        }

        const complaint = await prisma.complaint.findUnique({
            where: { id },
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found",
            });
        }

        // Soft delete by updating status to CLOSED
        await prisma.complaint.update({
            where: { id },
            data: {
                status: "CLOSED",
                resolvedAt: new Date(),
                resolvedBy: adminId,
                resolutionNote: "Complaint deleted by admin",
            },
        });

        // Add update record
        await prisma.complaintUpdate.create({
            data: {
                complaintId: id,
                updatedBy: adminId,
                updateType: "STATUS_CHANGE",
                message: "Complaint closed by admin",
                isInternal: true,
            },
        });

        res.json({
            success: true,
            message: "Complaint deleted successfully",
        });
    }
);