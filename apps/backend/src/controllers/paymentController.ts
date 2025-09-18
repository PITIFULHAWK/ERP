import { Request, Response } from "express";
import { asyncHandler } from "../middleware";
import prisma from "@repo/db";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary";
import emailQueueService from "../services/emailQueueService";

interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

interface CreatePaymentRequest {
    userId: string;
    type: "COURSE" | "HOSTEL" | "LIBRARY" | "MISC" | "SUMMERQUARTER";
    courseId?: string;
    hostelId?: string;
    amount: number;
    currency?: string;
    method?: "MANUAL" | "RAZORPAY" | "CARD" | "UPI";
    reference?: string;
    notes?: string;
}

interface VerifyPaymentRequest {
    status: "VERIFIED" | "REJECTED";
    verificationNotes?: string;
    rejectionReason?: string;
}

// Get all payments (Admin view)
export const getPayments = asyncHandler(async (req: Request, res: Response) => {
    const { status, type, userId } = req.query;

    // Validate status parameter
    const validStatuses = ["PENDING", "VERIFIED", "REJECTED", "FAILED"];
    const validTypes = ["COURSE", "HOSTEL", "LIBRARY", "MISC", "SUMMERQUARTER"];

    const whereClause: any = {};

    if (status && validStatuses.includes(status as string)) {
        whereClause.status = status as
            | "PENDING"
            | "VERIFIED"
            | "REJECTED"
            | "FAILED";
    }

    if (type && validTypes.includes(type as string)) {
        whereClause.type = type as
            | "COURSE"
            | "HOSTEL"
            | "LIBRARY"
            | "MISC"
            | "SUMMERQUARTER";
    }

    if (userId) {
        whereClause.userId = userId as string;
    }

    const payments = await prisma.payment.findMany({
        where: whereClause,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    university: {
                        select: {
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
                    totalFees: true,
                },
            },
            hostel: {
                select: {
                    id: true,
                    name: true,
                    fees: true,
                    type: true,
                },
            },
            receipts: {
                include: {
                    uploadedBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const response: ApiResponse = {
        success: true,
        message: "Payments retrieved successfully",
        data: payments,
    };

    res.json(response);
});

// Get payment by ID
export const getPaymentById = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        university: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                course: true,
                hostel: true,
                receipts: {
                    include: {
                        uploadedBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!payment) {
            const response: ApiResponse = {
                success: false,
                message: "Payment not found",
                error: "Not Found",
            };
            return res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: true,
            message: "Payment retrieved successfully",
            data: payment,
        };

        res.json(response);
    }
);

// Create payment (User submits payment)
export const createPayment = asyncHandler(
    async (req: Request, res: Response) => {
        console.log("=== Payment Creation Debug ===");
        console.log("Request method:", req.method);
        console.log("Request URL:", req.url);
        console.log("Request headers:", req.headers);
        console.log("Request body type:", typeof req.body);
        console.log("Request body:", req.body);
        console.log("Request body stringified:", JSON.stringify(req.body));
        console.log("================================");

        const paymentData: CreatePaymentRequest = req.body;

        // Check if request body exists and has required fields
        if (!paymentData || typeof paymentData !== "object") {
            console.log("❌ Request body validation failed:");
            console.log("- paymentData exists:", !!paymentData);
            console.log("- paymentData type:", typeof paymentData);
            console.log("- paymentData value:", paymentData);

            const response: ApiResponse = {
                success: false,
                message:
                    "Invalid request body - body is missing or not an object",
                error: "Bad Request",
            };
            return res.status(400).json(response);
        }

        // Check if amount exists and is valid
        if (
            !paymentData.amount ||
            typeof paymentData.amount !== "number" ||
            paymentData.amount <= 0
        ) {
            console.log("❌ Amount validation failed:");
            console.log("- amount exists:", !!paymentData.amount);
            console.log("- amount type:", typeof paymentData.amount);
            console.log("- amount value:", paymentData.amount);

            const response: ApiResponse = {
                success: false,
                message: "Amount must be a valid number greater than zero",
                error: "Bad Request",
            };
            return res.status(400).json(response);
        }

        // Check if userId exists
        if (!paymentData.userId || typeof paymentData.userId !== "string") {
            const response: ApiResponse = {
                success: false,
                message: "UserId is required and must be a string",
                error: "Bad Request",
            };
            return res.status(400).json(response);
        }

        // Check if type exists and is valid
        const validTypes = [
            "COURSE",
            "HOSTEL",
            "LIBRARY",
            "MISC",
            "SUMMERQUARTER",
        ];
        if (!paymentData.type || !validTypes.includes(paymentData.type)) {
            const response: ApiResponse = {
                success: false,
                message: `Type must be one of: ${validTypes.join(", ")}`,
                error: "Bad Request",
            };
            return res.status(400).json(response);
        }

        if (paymentData.type === "COURSE" && !paymentData.courseId) {
            const response: ApiResponse = {
                success: false,
                message: "courseId is required for COURSE payments",
                error: "Bad Request",
            };
            return res.status(400).json(response);
        }

        if (paymentData.type === "HOSTEL" && !paymentData.hostelId) {
            const response: ApiResponse = {
                success: false,
                message: "hostelId is required for HOSTEL payments",
                error: "Bad Request",
            };
            return res.status(400).json(response);
        }

        try {
            // Check if user exists
            const user = await prisma.user.findUnique({
                where: { id: paymentData.userId },
                include: { university: true },
            });

            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not found",
                    error: "Not Found",
                };
                return res.status(404).json(response);
            }

            // Verify course/hostel exists
            if (paymentData.type === "COURSE" && paymentData.courseId) {
                const course = await prisma.course.findUnique({
                    where: { id: paymentData.courseId },
                });
                if (!course) {
                    const response: ApiResponse = {
                        success: false,
                        message: "Course not found",
                        error: "Not Found",
                    };
                    return res.status(404).json(response);
                }
            }

            if (paymentData.type === "HOSTEL" && paymentData.hostelId) {
                const hostel = await prisma.hostel.findUnique({
                    where: { id: paymentData.hostelId },
                });
                if (!hostel) {
                    const response: ApiResponse = {
                        success: false,
                        message: "Hostel not found",
                        error: "Not Found",
                    };
                    return res.status(404).json(response);
                }
            }

            const payment = await prisma.payment.create({
                data: {
                    userId: paymentData.userId,
                    type: paymentData.type,
                    courseId:
                        paymentData.type === "COURSE"
                            ? paymentData.courseId
                            : null,
                    hostelId:
                        paymentData.type === "HOSTEL"
                            ? paymentData.hostelId
                            : null,
                    amount: paymentData.amount,
                    currency: paymentData.currency || "INR",
                    method: paymentData.method || "MANUAL",
                    status: "PENDING",
                    reference: paymentData.reference,
                    notes: paymentData.notes,
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                    course: true,
                    hostel: true,
                },
            });

            // Send payment submitted email
            try {
                await emailQueueService.queuePaymentSubmittedEmail(
                    payment.user.email,
                    payment.user.name,
                    payment.id,
                    payment.amount,
                    payment.currency,
                    payment.type
                );
            } catch (emailError) {
                console.error(
                    "Failed to queue payment submitted email:",
                    emailError
                );
                // Don't fail the request if email fails
            }

            const response: ApiResponse = {
                success: true,
                message: "Payment submitted successfully",
                data: payment,
            };

            res.status(201).json(response);
        } catch (error) {
            console.error("Error creating payment:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to create payment",
                error:
                    error instanceof Error ? error.message : "Creation failed",
            };
            res.status(500).json(response);
        }
    }
);

// Upload receipt for payment
export const uploadReceipt = asyncHandler(
    async (req: Request, res: Response) => {
        const { paymentId, notes } = req.body;
        const file = req.file;
        const uploadedById = req.headers["x-user-id"] as string; // Get from JWT in real app

        if (!file) {
            const response: ApiResponse = {
                success: false,
                message: "No file uploaded",
                error: "Bad Request",
            };
            return res.status(400).json(response);
        }

        if (!paymentId || !uploadedById) {
            const response: ApiResponse = {
                success: false,
                message: "Payment ID and uploader ID are required",
                error: "Bad Request",
            };
            return res.status(400).json(response);
        }

        try {
            // Check if payment exists
            const payment = await prisma.payment.findUnique({
                where: { id: paymentId },
                include: { user: true },
            });

            if (!payment) {
                const response: ApiResponse = {
                    success: false,
                    message: "Payment not found",
                    error: "Not Found",
                };
                return res.status(404).json(response);
            }

            // Upload receipt to Cloudinary
            const originalFileName = file.originalname;
            const cleanFileName = originalFileName.replace(
                /[^a-zA-Z0-9.-]/g,
                "_"
            );
            const uploadResult = await uploadToCloudinary(
                file.buffer,
                cleanFileName,
                `payment-receipts/${paymentId}`
            );

            // Create receipt record
            const receipt = await prisma.receipt.create({
                data: {
                    paymentId,
                    mediaUrl: uploadResult.secure_url,
                    mediaType: file.mimetype,
                    uploadedById,
                    notes,
                },
                include: {
                    payment: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    uploadedBy: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            // Send receipt uploaded email
            try {
                await emailQueueService.queueReceiptUploadedEmail(
                    receipt.payment.user.email,
                    receipt.payment.user.name,
                    receipt.paymentId,
                    receipt.id
                );
            } catch (emailError) {
                console.error(
                    "Failed to queue receipt uploaded email:",
                    emailError
                );
            }

            const response: ApiResponse = {
                success: true,
                message: "Receipt uploaded successfully",
                data: {
                    ...receipt,
                    cloudinaryPublicId: uploadResult.public_id,
                },
            };

            res.status(201).json(response);
        } catch (error) {
            console.error("Error uploading receipt:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to upload receipt",
                error: error instanceof Error ? error.message : "Upload failed",
            };
            res.status(500).json(response);
        }
    }
);

// Verify payment (Admin only)
export const verifyPayment = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const {
            status,
            verificationNotes,
            rejectionReason,
        }: VerifyPaymentRequest = req.body;
        const verifierId = req.headers["x-verifier-id"] as string; // Get from JWT in real app

        if (!verifierId) {
            const response: ApiResponse = {
                success: false,
                message: "Verifier ID required",
                error: "Bad Request",
            };
            return res.status(400).json(response);
        }

        // Check if verifier exists
        const verifier = await prisma.user.findUnique({
            where: { id: verifierId },
        });

        if (!verifier) {
            const response: ApiResponse = {
                success: false,
                message: "Invalid verifier ID - user not found",
                error: "Bad Request",
            };
            return res.status(400).json(response);
        }

        try {
            const payment = await prisma.payment.update({
                where: { id },
                data: {
                    status,
                    verifiedById: verifierId,
                    verifiedAt: new Date(),
                    verificationNotes,
                    rejectionReason:
                        status === "REJECTED" ? rejectionReason : null,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            university: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    course: true,
                    hostel: true,
                },
            });

            // Update user payment status if verified
            if (status === "VERIFIED") {
                const updateData: any = {};
                if (payment.type === "COURSE") {
                    updateData.coursePayStatus = "VERIFIED";
                } else if (payment.type === "HOSTEL") {
                    updateData.hostelPayStatus = "VERIFIED";
                }

                if (Object.keys(updateData).length > 0) {
                    await prisma.user.update({
                        where: { id: payment.userId },
                        data: updateData,
                    });
                }
            }

            // Send payment verification email
            try {
                await emailQueueService.queuePaymentVerifiedEmail(
                    payment.user.email,
                    payment.user.name,
                    payment.id,
                    status,
                    payment.amount,
                    payment.currency,
                    payment.type,
                    verificationNotes,
                    {
                        courseName: payment.course?.name,
                        hostelName: payment.hostel?.name,
                        paymentMethod: payment.method,
                        reference: payment.reference || "",
                        verifiedBy: verifier.name,
                        verifiedAt: payment.verifiedAt?.toISOString(),
                        universityName:
                            payment.user.university?.name || "University",
                    }
                );
            } catch (emailError) {
                console.error(
                    "Failed to queue payment verification email:",
                    emailError
                );
            }

            const response: ApiResponse = {
                success: true,
                message: `Payment ${status.toLowerCase()} successfully`,
                data: payment,
            };

            res.json(response);
        } catch (error) {
            console.error("Error verifying payment:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to verify payment",
                error:
                    error instanceof Error
                        ? error.message
                        : "Verification failed",
            };
            res.status(500).json(response);
        }
    }
);

// Delete payment
export const deletePayment = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            // Get payment with receipts
            const payment = await prisma.payment.findUnique({
                where: { id },
                include: { receipts: true },
            });

            if (!payment) {
                const response: ApiResponse = {
                    success: false,
                    message: "Payment not found",
                    error: "Not Found",
                };
                return res.status(404).json(response);
            }

            // Delete receipts from Cloudinary
            for (const receipt of payment.receipts) {
                try {
                    const urlParts = receipt.mediaUrl.split("/");
                    const fileNameWithExtension = urlParts[urlParts.length - 1];
                    const fileName = fileNameWithExtension.split(".")[0];
                    const publicId = `payment-receipts/${payment.id}/${fileName}`;
                    await deleteFromCloudinary(publicId);
                } catch (cloudinaryError) {
                    console.error(
                        "Error deleting receipt from Cloudinary:",
                        cloudinaryError
                    );
                }
            }

            // Delete payment (cascade will delete receipts)
            await prisma.payment.delete({
                where: { id },
            });

            const response: ApiResponse = {
                success: true,
                message: "Payment deleted successfully",
            };

            res.json(response);
        } catch (error) {
            console.error("Error deleting payment:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to delete payment",
                error: error instanceof Error ? error.message : "Delete failed",
            };
            res.status(500).json(response);
        }
    }
);

// Get payment summary/statistics
export const getPaymentSummary = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const summary = await prisma.payment.groupBy({
                by: ["status", "type"],
                _count: {
                    id: true,
                },
                _sum: {
                    amount: true,
                },
            });

            const totalPayments = await prisma.payment.count();
            const totalAmount = await prisma.payment.aggregate({
                _sum: {
                    amount: true,
                },
            });

            const response: ApiResponse = {
                success: true,
                message: "Payment summary retrieved successfully",
                data: {
                    totalPayments,
                    totalAmount: totalAmount._sum.amount || 0,
                    summary,
                },
            };

            res.json(response);
        } catch (error) {
            console.error("Error getting payment summary:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to get payment summary",
                error:
                    error instanceof Error ? error.message : "Summary failed",
            };
            res.status(500).json(response);
        }
    }
);
