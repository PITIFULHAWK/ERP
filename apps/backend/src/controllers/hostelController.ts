import { Request, Response } from "express";
import prisma from "@repo/db";
import { CreateHostelRequest, ApiResponse } from "../types";
import { asyncHandler } from "../middleware";

// Get all hostels
export const getHostels = asyncHandler(async (req: Request, res: Response) => {
    const { universityId } = req.query;

    const hostels = await prisma.hostel.findMany({
        where: universityId ? { universityId: universityId as string } : {},
        include: {
            university: true,
            _count: {
                select: {
                    users: true,
                },
            },
        },
    });

    const response: ApiResponse = {
        success: true,
        message: "Hostels retrieved successfully",
        data: hostels,
    };

    res.json(response);
});

// Get hostel by ID
export const getHostelById = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const hostel = await prisma.hostel.findUnique({
            where: { id },
            include: {
                university: true,
                users: true,
            },
        });

        if (!hostel) {
            const response: ApiResponse = {
                success: false,
                message: "Hostel not found",
                error: "Not Found",
            };
            return res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: true,
            message: "Hostel retrieved successfully",
            data: hostel,
        };

        res.json(response);
    }
);

// Create hostel (Admin only)
export const createHostel = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            name,
            fees,
            totalCapacity,
            type,
            universityId,
        }: CreateHostelRequest = req.body;

        const hostel = await prisma.hostel.create({
            data: {
                name,
                fees,
                totalCapacity,
                type,
                universityId,
            },
            include: {
                university: true,
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Hostel created successfully",
            data: hostel,
        };

        res.status(201).json(response);
    }
);

// Update hostel (Admin only)
export const updateHostel = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const updateData = req.body;

        const hostel = await prisma.hostel.update({
            where: { id },
            data: updateData,
            include: {
                university: true,
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Hostel updated successfully",
            data: hostel,
        };

        res.json(response);
    }
);

export const addStudentToHostel = asyncHandler(
    async (req: Request, res: Response) => {
        const { hostelId, userId } = req.params;

        // 1. Find the hostel and check if it has capacity
        const hostel = await prisma.hostel.findUnique({
            where: { id: hostelId },
        });

        if (!hostel) {
            return res.status(404).json({ message: "Hostel not found" });
        }

        if (hostel.currentTotalStudents >= hostel.totalCapacity) {
            return res.status(400).json({ message: "Hostel is already full" });
        }

        // 2. Add the student and increment the student count in one transaction
        const updatedHostel = await prisma.hostel.update({
            where: { id: hostelId },
            data: {
                // Connect the user to this hostel
                users: {
                    connect: { id: userId },
                },
                // Increment the student count
                currentTotalStudents: {
                    increment: 1,
                },
            },
        });

        res.json({
            success: true,
            message: "Student successfully added to hostel",
            data: updatedHostel,
        });
    }
);

// Delete hostel (Admin only)
export const deleteHostel = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        await prisma.hostel.delete({
            where: { id },
        });

        const response: ApiResponse = {
            success: true,
            message: "Hostel deleted successfully",
        };

        res.json(response);
    }
);
