import { Request, Response } from "express";
import prisma from "@repo/db";
import { asyncHandler } from "../middleware";
import { ApiResponse } from "../types";

// Get all notices
export const getAllNotices = asyncHandler(
    async (req: Request, res: Response) => {
        const { universityId } = req.query;

        // Build where clause based on query parameters
        const whereClause = universityId
            ? { universityId: universityId as string }
            : {};

        const notices = await prisma.notice.findMany({
            where: whereClause,
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                        uid: true,
                    },
                },
            },
            orderBy: {
                publishedAt: "desc",
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Notices fetched successfully",
            data: notices,
        };
        res.json(response);
    }
);
// Get notice by ID
export const getNoticeById = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!id) {
            const response: ApiResponse = {
                success: false,
                message: "Notice ID is required",
                error: "Missing ID parameter",
            };
            return res.status(400).json(response);
        }

        const notice = await prisma.notice.findUnique({
            where: { id },
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                        uid: true,
                    },
                },
            },
        });

        if (!notice) {
            const response: ApiResponse = {
                success: false,
                message: "Notice not found",
                error: "Not Found",
            };
            return res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: true,
            message: "Notice fetched successfully",
            data: notice,
        };
        res.json(response);
    }
);

// Create new notice (Admin only)
export const createNotice = asyncHandler(
    async (req: Request, res: Response) => {
        const { title, content, universityId } = req.body;

        if (!title || !content || !universityId) {
            const response: ApiResponse = {
                success: false,
                message: "Title, content, and university ID are required",
                error: "Missing required fields",
            };
            return res.status(400).json(response);
        }

        // Verify university exists
        const university = await prisma.university.findUnique({
            where: { id: universityId },
        });

        if (!university) {
            const response: ApiResponse = {
                success: false,
                message: "University not found",
                error: "Invalid university ID",
            };
            return res.status(404).json(response);
        }

        const notice = await prisma.notice.create({
            data: {
                title,
                content,
                universityId,
            },
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                        uid: true,
                    },
                },
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Notice created successfully",
            data: notice,
        };

        res.status(201).json(response);
    }
);

// Update notice (Admin only)
export const updateNotice = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const { title, content } = req.body;

        if (!id) {
            const response: ApiResponse = {
                success: false,
                message: "Notice ID is required",
                error: "Missing ID parameter",
            };
            return res.status(400).json(response);
        }

        // Check if notice exists
        const existingNotice = await prisma.notice.findUnique({
            where: { id },
        });

        if (!existingNotice) {
            const response: ApiResponse = {
                success: false,
                message: "Notice not found",
                error: "Not Found",
            };
            return res.status(404).json(response);
        }

        const updateData: any = {};
        if (title) updateData.title = title;
        if (content) updateData.content = content;

        const notice = await prisma.notice.update({
            where: { id },
            data: updateData,
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                        uid: true,
                    },
                },
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Notice updated successfully",
            data: notice,
        };

        res.json(response);
    }
);

// Delete notice (Admin only)
export const deleteNotice = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        if (!id) {
            const response: ApiResponse = {
                success: false,
                message: "Notice ID is required",
                error: "Missing ID parameter",
            };
            return res.status(400).json(response);
        }

        // Check if notice exists
        const existingNotice = await prisma.notice.findUnique({
            where: { id },
        });

        if (!existingNotice) {
            const response: ApiResponse = {
                success: false,
                message: "Notice not found",
                error: "Not Found",
            };
            return res.status(404).json(response);
        }

        await prisma.notice.delete({
            where: { id },
        });

        const response: ApiResponse = {
            success: true,
            message: "Notice deleted successfully",
        };

        res.json(response);
    }
);
