import { Request, Response } from "express";
import prisma from "@repo/db";
import {
    CreateApplicationRequest,
    CreateDocumentRequest,
    VerifyApplicationRequest,
    ApiResponse,
} from "../types";
import { asyncHandler } from "../middleware";
import emailQueueService from "../services/emailQueueService";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary";

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

// Get all documents with application details (Admin view)
export const getAllDocuments = asyncHandler(
    async (req: Request, res: Response) => {
        const { applicationId, documentType, isVerified } = req.query;

        const documents = await prisma.document.findMany({
            where: {
                ...(applicationId && {
                    applicationId: applicationId as string,
                }),
                ...(documentType && { type: documentType as any }),
                ...(isVerified !== undefined && {
                    isVerified: isVerified === "true",
                }),
            },
            include: {
                application: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        status: true,
                        user: {
                            select: {
                                email: true,
                                university: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
                verifiedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                uploadedAt: "desc",
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Documents retrieved successfully",
            data: documents,
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

        // Send application submitted email
        try {
            await emailQueueService.queueApplicationSubmittedEmail(
                application.user.email,
                application.user.name,
                application.id
            );
        } catch (emailError) {
            console.error(
                "Failed to queue application submitted email:",
                emailError
            );
            // Don't fail the request if email fails
        }

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

        // Send application status update email
        try {
            await emailQueueService.queueApplicationVerifiedEmail(
                application.user.email,
                application.user.name,
                application.id,
                status,
                verificationNotes
            );
        } catch (emailError) {
            console.error(
                "Failed to queue application verification email:",
                emailError
            );
            // Don't fail the request if email fails
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
    const { type, applicationId } = req.body;
    const file = req.file;

    if (!file) {
        const response: ApiResponse = {
            success: false,
            message: "No file uploaded",
            error: "Bad Request",
        };
        return res.status(400).json(response);
    }

    if (!type || !applicationId) {
        const response: ApiResponse = {
            success: false,
            message: "Document type and application ID are required",
            error: "Bad Request",
        };
        return res.status(400).json(response);
    }

    try {
        // Check if application exists
        console.log("Searching for application with ID:", applicationId);

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
        });

        console.log("Application found:", application ? "Yes" : "No");

        if (!application) {
            console.log("Application not found for ID:", applicationId);
            const response: ApiResponse = {
                success: false,
                message: `Application not found with ID: ${applicationId}`,
                error: "Not Found",
            };
            return res.status(404).json(response);
        }

        // Get user details separately if needed
        const userDetails = await prisma.user.findUnique({
            where: { id: application.userId },
        });

        console.log("User details found:", userDetails ? "Yes" : "No");

        // Upload file to Cloudinary
        const originalFileName = file.originalname;
        const cleanFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uploadResult = await uploadToCloudinary(
            file.buffer,
            cleanFileName,
            `erp-documents/${applicationId}`
        );

        // Create document record in database
        const document = await prisma.document.create({
            data: {
                type: type as any,
                fileName: originalFileName,
                fileUrl: uploadResult.secure_url,
                fileSize: uploadResult.bytes,
                mimeType: file.mimetype,
                applicationId,
            },
            include: {
                application: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        user: {
                            select: {
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Document uploaded successfully",
            data: {
                ...document,
                cloudinaryPublicId: uploadResult.public_id,
            },
        };

        res.status(201).json(response);
    } catch (error) {
        console.error("Error uploading document:", error);
        const response: ApiResponse = {
            success: false,
            message: "Failed to upload document",
            error: error instanceof Error ? error.message : "Upload failed",
        };
        res.status(500).json(response);
    }
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
                application: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        // Send document verified email
        try {
            await emailQueueService.queueDocumentVerifiedEmail(
                document.application.user.email,
                document.application.user.name,
                document.type,
                document.applicationId
            );
        } catch (emailError) {
            console.error(
                "Failed to queue document verification email:",
                emailError
            );
            // Don't fail the request if email fails
        }

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

// Delete document
export const deleteDocument = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            // Get document details first
            const document = await prisma.document.findUnique({
                where: { id },
            });

            if (!document) {
                const response: ApiResponse = {
                    success: false,
                    message: "Document not found",
                    error: "Not Found",
                };
                return res.status(404).json(response);
            }

            // Extract public_id from Cloudinary URL
            const urlParts = document.fileUrl.split("/");
            const fileNameWithExtension = urlParts[urlParts.length - 1];
            const fileName = fileNameWithExtension.split(".")[0];
            const publicId = `erp-documents/${document.applicationId}/${fileName}`;

            // Delete from Cloudinary
            try {
                await deleteFromCloudinary(publicId);
            } catch (cloudinaryError) {
                console.error(
                    "Error deleting from Cloudinary:",
                    cloudinaryError
                );
                // Continue with database deletion even if Cloudinary deletion fails
            }

            // Delete from database
            await prisma.document.delete({
                where: { id },
            });

            const response: ApiResponse = {
                success: true,
                message: "Document deleted successfully",
            };

            res.json(response);
        } catch (error) {
            console.error("Error deleting document:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to delete document",
                error: error instanceof Error ? error.message : "Delete failed",
            };
            res.status(500).json(response);
        }
    }
);

// Check if application exists (Debug endpoint)
export const checkApplicationExists = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        console.log("Checking application existence for ID:", id);

        const application = await prisma.application.findUnique({
            where: { id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                status: true,
                userId: true,
                createdAt: true,
            },
        });

        const response: ApiResponse = {
            success: true,
            message: application
                ? "Application found"
                : "Application not found",
            data: {
                exists: !!application,
                application: application,
                searchedId: id,
            },
        };

        res.json(response);
    }
);
