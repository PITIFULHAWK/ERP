import { Request, Response } from "express";
import { asyncHandler } from "../middleware";
import prisma from "@repo/db";
import emailQueueService from "../services/emailQueueService";

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

// Types
interface CreatePlacementRequest {
    title: string;
    description: string;
    companyName: string;
    position: string;
    packageOffered?: string;
    cgpaCriteria?: number;
    location?: string;
    applicationDeadline?: string;
}

interface UpdatePlacementRequest extends Partial<CreatePlacementRequest> {
    status?: "ACTIVE" | "CLOSED" | "DRAFT";
}

// Get all placements (Admin view)
export const getPlacements = asyncHandler(
    async (req: Request, res: Response) => {
        const { status, page = 1, limit = 10 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const where = status
            ? { status: status as "ACTIVE" | "CLOSED" | "DRAFT" }
            : {};

        const [placements, total] = await Promise.all([
            prisma.placement.findMany({
                where,
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: Number(limit),
            }),
            prisma.placement.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                placements,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit)),
                },
            },
        });
    }
);

// Get placement by ID
export const getPlacementById = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const placement = await prisma.placement.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!placement) {
            return res.status(404).json({
                success: false,
                message: "Placement not found",
            });
        }

        res.json({
            success: true,
            data: placement,
        });
    }
);

// Create new placement (Admin only)
export const createPlacement = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const placementData: CreatePlacementRequest = req.body;

        // Validate required fields
        if (
            !placementData.title ||
            !placementData.description ||
            !placementData.companyName ||
            !placementData.position
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Title, description, company name, and position are required",
            });
        }

        // Ensure we have a valid user ID
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                message: "User authentication required",
            });
        }

        const placement = await prisma.placement.create({
            data: {
                title: placementData.title,
                description: placementData.description,
                companyName: placementData.companyName,
                position: placementData.position,
                packageOffered: placementData.packageOffered,
                cgpaCriteria: placementData.cgpaCriteria,
                location: placementData.location,
                applicationDeadline: placementData.applicationDeadline
                    ? new Date(placementData.applicationDeadline)
                    : null,
                createdById: req.user.id, // Use authenticated user ID
            },
            include: {
                createdBy: {
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
            message: "Placement created successfully",
            data: placement,
        });
    }
);

// Update placement (Admin only)
export const updatePlacement = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const updateData: UpdatePlacementRequest = req.body;

        const existingPlacement = await prisma.placement.findUnique({
            where: { id },
        });

        if (!existingPlacement) {
            return res.status(404).json({
                success: false,
                message: "Placement not found",
            });
        }

        const placement = await prisma.placement.update({
            where: { id },
            data: {
                ...(updateData.title && { title: updateData.title }),
                ...(updateData.description && {
                    description: updateData.description,
                }),
                ...(updateData.companyName && {
                    companyName: updateData.companyName,
                }),
                ...(updateData.position && { position: updateData.position }),
                ...(updateData.packageOffered !== undefined && {
                    packageOffered: updateData.packageOffered,
                }),
                ...(updateData.cgpaCriteria !== undefined && {
                    cgpaCriteria: updateData.cgpaCriteria,
                }),
                ...(updateData.location !== undefined && {
                    location: updateData.location,
                }),
                ...(updateData.applicationDeadline && {
                    applicationDeadline: new Date(
                        updateData.applicationDeadline
                    ),
                }),
                ...(updateData.status && { status: updateData.status }),
            },
            include: {
                createdBy: {
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
            message: "Placement updated successfully",
            data: placement,
        });
    }
);

// Delete placement (Admin only)
export const deletePlacement = asyncHandler(
    async (
        req: Request & { user?: { id: string; role: string } },
        res: Response
    ) => {
        const { id } = req.params;

        console.log("Delete placement request received for ID:", id);
        console.log("User from auth middleware:", req.user);

        const existingPlacement = await prisma.placement.findUnique({
            where: { id },
        });

        if (!existingPlacement) {
            console.log("Placement not found with ID:", id);
            return res.status(404).json({
                success: false,
                message: "Placement not found",
            });
        }

        console.log("Found placement to delete:", existingPlacement.title);

        await prisma.placement.delete({
            where: { id },
        });

        console.log("Placement deleted successfully");

        res.json({
            success: true,
            message: "Placement deleted successfully",
        });
    }
);

// Get eligible users count (before sending emails)
export const getEligibleUsersCount = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const placement = await prisma.placement.findUnique({
            where: { id },
        });

        if (!placement) {
            return res.status(404).json({
                success: false,
                message: "Placement not found",
            });
        }

        // Build where clause for eligible users
        const whereClause: any = {
            role: "STUDENT", // Only students get placement notifications
        };

        // Add CGPA criteria if specified
        if (placement.cgpaCriteria && placement.cgpaCriteria > 0) {
            whereClause.cgpa = {
                gte: placement.cgpaCriteria,
            };
        }

        const eligibleCount = await prisma.user.count({
            where: whereClause,
        });

        res.json({
            success: true,
            data: {
                placementId: placement.id,
                placementTitle: placement.title,
                cgpaCriteria: placement.cgpaCriteria,
                eligibleUsersCount: eligibleCount,
            },
        });
    }
);

// Send placement notification emails (Admin only)
export const sendPlacementNotification = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const placement = await prisma.placement.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!placement) {
            return res.status(404).json({
                success: false,
                message: "Placement not found",
            });
        }

        if (placement.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Only active placements can send notifications",
            });
        }

        // Build where clause for eligible users
        const whereClause: any = {
            role: "STUDENT", // Only students get placement notifications
        };

        // Add CGPA criteria if specified
        if (placement.cgpaCriteria && placement.cgpaCriteria > 0) {
            whereClause.cgpa = {
                gte: placement.cgpaCriteria,
            };
        }

        // Get eligible users
        const eligibleUsers = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                cgpa: true,
            },
        });

        if (eligibleUsers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No eligible users found for this placement",
            });
        }

        // Here you integrate with your email service
        try {
            // Send emails using the existing email queue service
            const emailPromises = eligibleUsers.map(async (user: any) => {
                try {
                    // Add email to queue using the placement notification method
                    await emailQueueService.queuePlacementNotificationEmail(
                        user.email,
                        user.name,
                        user.cgpa,
                        placement
                    );

                    console.log(
                        `✅ Queued placement email for ${user.email} (${placement.title})`
                    );

                    return {
                        userId: user.id,
                        email: user.email,
                        status: "queued",
                    };
                } catch (emailError) {
                    console.error(
                        `❌ Failed to queue email for ${user.email}:`,
                        emailError
                    );
                    return {
                        userId: user.id,
                        email: user.email,
                        status: "failed",
                        error:
                            emailError instanceof Error
                                ? emailError.message
                                : "Unknown error",
                    };
                }
            });

            const emailResults = await Promise.all(emailPromises);
            const successfulEmails = emailResults.filter(
                (result: any) => result.status === "queued"
            );

            // Update placement with emails sent count
            await prisma.placement.update({
                where: { id },
                data: {
                    emailsSent: successfulEmails.length,
                },
            });

            res.json({
                success: true,
                message: `Placement notification sent successfully`,
                data: {
                    placementTitle: placement.title,
                    eligibleUsersFound: eligibleUsers.length,
                    emailsSent: successfulEmails.length,
                    cgpaCriteria: placement.cgpaCriteria,
                    recipients: eligibleUsers.map((user: any) => ({
                        name: user.name,
                        email: user.email,
                        cgpa: user.cgpa,
                    })),
                },
            });
        } catch (error) {
            console.error("Error sending placement notifications:", error);
            res.status(500).json({
                success: false,
                message: "Failed to send placement notifications",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

// Get placement statistics (Admin dashboard)
export const getPlacementStats = asyncHandler(
    async (req: Request, res: Response) => {
        const [totalPlacements, activePlacements, totalEmailsSent] =
            await Promise.all([
                prisma.placement.count(),
                prisma.placement.count({ where: { status: "ACTIVE" } }),
                prisma.placement.aggregate({
                    _sum: {
                        emailsSent: true,
                    },
                }),
            ]);

        res.json({
            success: true,
            data: {
                totalPlacements,
                activePlacements,
                closedPlacements: totalPlacements - activePlacements,
                totalEmailsSent: totalEmailsSent._sum.emailsSent || 0,
            },
        });
    }
);
