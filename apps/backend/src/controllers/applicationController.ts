import { Request, Response } from "express";
import prisma from "@repo/db";
import {
    CreateApplicationRequest,
    CreateDocumentRequest,
    VerifyApplicationRequest,
    ApiResponse,
} from "../types";
import { asyncHandler } from "../middleware";

// Get all applications
export const getApplications = asyncHandler(
    async (req: Request, res: Response) => {
        const { status, universityId } = req.query;

        const applications = await prisma.application.findMany({
            where: {
                ...(status && { status: status as any }),
                ...(universityId && {
                    user: {
                        universityId: universityId as string,
                    },
                }),
            },
            include: {
                user: {
                    include: {
                        university: true,
                    },
                },
                preferredCourse: true,
                documents: true,
                verifiedBy: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Applications retrieved successfully",
            data: applications,
        };

        res.json(response);
    }
);

// Get application by ID
export const getApplicationById = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                user: {
                    include: {
                        university: true,
                    },
                },
                preferredCourse: true,
                documents: {
                    include: {
                        verifiedBy: true,
                    },
                },
                verifiedBy: true,
            },
        });

        if (!application) {
            const response: ApiResponse = {
                success: false,
                message: "Application not found",
                error: "Not Found",
            };
            return res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: true,
            message: "Application retrieved successfully",
            data: application,
        };

        res.json(response);
    }
);

// Create application (User fills the form)
export const createApplication = asyncHandler(
    async (req: Request, res: Response) => {
        const applicationData: CreateApplicationRequest = req.body;

        // Check if user already has an application
        const existingApplication = await prisma.application.findUnique({
            where: { userId: applicationData.userId },
        });

        if (existingApplication) {
            const response: ApiResponse = {
                success: false,
                message: "User already has an application",
                error: "Conflict",
            };
            return res.status(409).json(response);
        }

        const application = await prisma.application.create({
            data: {
                ...applicationData,
                dateOfBirth: new Date(applicationData.dateOfBirth),
            },
            include: {
                user: true,
                preferredCourse: true,
                documents: true,
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Application submitted successfully",
            data: application,
        };

        res.status(201).json(response);
    }
);

// Update application
export const updateApplication = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const updateData = req.body;

        // Convert dateOfBirth to Date if provided
        if (updateData.dateOfBirth) {
            updateData.dateOfBirth = new Date(updateData.dateOfBirth);
        }

        const application = await prisma.application.update({
            where: { id },
            data: updateData,
            include: {
                user: true,
                preferredCourse: true,
                documents: true,
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Application updated successfully",
            data: application,
        };

        res.json(response);
    }
);

// Verify application (Verifier only)
export const verifyApplication = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const {
            status,
            verificationNotes,
            rejectionReason,
        }: VerifyApplicationRequest = req.body;
        const verifierId = req.headers["x-verifier-id"] as string; // In real app, get from JWT

        if (!verifierId) {
            const response: ApiResponse = {
                success: false,
                message: "Verifier ID required",
                error: "Bad Request",
            };
            return res.status(400).json(response);
        }

        const application = await prisma.application.update({
            where: { id },
            data: {
                status,
                verifiedById: verifierId,
                verifiedAt: new Date(),
                verificationNotes,
                rejectionReason: status === "REJECTED" ? rejectionReason : null,
            },
            include: {
                user: true,
                preferredCourse: true,
                documents: true,
                verifiedBy: true,
            },
        });

        // If verified, update user status
        if (status === "VERIFIED") {
            await prisma.user.update({
                where: { id: application.userId },
                data: { userStatus: "VERIFIED" },
            });
        }

        const response: ApiResponse = {
            success: true,
            message: `Application ${status.toLowerCase()} successfully`,
            data: application,
        };

        res.json(response);
    }
);

// Add document to application
export const addDocument = asyncHandler(async (req: Request, res: Response) => {
    const documentData: CreateDocumentRequest = req.body;

    const document = await prisma.document.create({
        data: documentData,
    });

    const response: ApiResponse = {
        success: true,
        message: "Document added successfully",
        data: document,
    };

    res.status(201).json(response);
});

// Verify document
export const verifyDocument = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const verifierId = req.headers["x-verifier-id"] as string;

        if (!verifierId) {
            const response: ApiResponse = {
                success: false,
                message: "Verifier ID required",
                error: "Bad Request",
            };
            return res.status(400).json(response);
        }

        const document = await prisma.document.update({
            where: { id },
            data: {
                isVerified: true,
                verifiedById: verifierId,
                verifiedAt: new Date(),
            },
            include: {
                verifiedBy: true,
                application: true,
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Document verified successfully",
            data: document,
        };

        res.json(response);
    }
);

// Delete application
export const deleteApplication = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        await prisma.application.delete({
            where: { id },
        });

        const response: ApiResponse = {
            success: true,
            message: "Application deleted successfully",
        };

        res.json(response);
    }
);
