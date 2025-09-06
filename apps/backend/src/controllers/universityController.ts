import { Request, Response } from "express";
import prisma from "@repo/db";
import bcrypt from "bcrypt";
import { CreateUniversityRequest, ApiResponse } from "../types";
import { asyncHandler } from "../middleware";

// Get all universities
export const getUniversities = asyncHandler(
    async (req: Request, res: Response) => {
        const universities = await prisma.university.findMany({
            include: {
                courses: true,
                hostels: true,
                _count: {
                    select: {
                        users: true,
                        courses: true,
                        hostels: true,
                    },
                },
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Universities retrieved successfully",
            data: universities,
        };

        res.json(response);
    }
);

// Get university by ID
export const getUniversityById = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const university = await prisma.university.findUnique({
            where: { id },
            include: {
                courses: true,
                hostels: true,
                notices: true,
                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        });

        if (!university) {
            const response: ApiResponse = {
                success: false,
                message: "University not found",
                error: "Not Found",
            };
            return res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: true,
            message: "University retrieved successfully",
            data: university,
        };

        res.json(response);
    }
);

export const onboardUniversity = asyncHandler(
    async (req: Request, res: Response) => {
        const { universityName, adminName, adminEmail, adminPassword } =
            req.body;

        // It's good practice to check if the admin email already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail },
        });
        if (existingAdmin) {
            return res
                .status(409)
                .json({
                    success: false,
                    message: "An admin with this email already exists.",
                });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the University
            const newUniversity = await tx.university.create({
                data: { name: universityName },
            });

            // 2. Hash the admin's password
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            // 3. Create the first Admin user
            const newAdmin = await tx.user.create({
                data: {
                    name: adminName,
                    email: adminEmail,
                    password: hashedPassword,
                    role: "ADMIN",
                    universityId: newUniversity.id,
                },
            });

            // Exclude password from the returned object
            const { password, ...adminWithoutPassword } = newAdmin;

            return { newUniversity, newAdmin: adminWithoutPassword };
        });

        const response: ApiResponse = {
            success: true,
            message: "University and its first admin onboarded successfully",
            data: result,
        };

        res.status(201).json(response);
    }
);

// Create university (Admin only)
export const createUniversity = asyncHandler(
    async (req: Request, res: Response) => {
        const { name, uid }: CreateUniversityRequest = req.body;

        // Check if university with same UID exists
        const existingUniversity = await prisma.university.findUnique({
            where: { uid },
        });

        if (existingUniversity) {
            const response: ApiResponse = {
                success: false,
                message: "University with this UID already exists",
                error: "Conflict",
            };
            return res.status(409).json(response);
        }

        const university = await prisma.university.create({
            data: { name, uid },
        });

        const response: ApiResponse = {
            success: true,
            message: "University created successfully",
            data: university,
        };

        res.status(201).json(response);
    }
);

// Update university (Admin only)
export const updateUniversity = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const updateData = req.body;

        const university = await prisma.university.update({
            where: { id },
            data: updateData,
        });

        const response: ApiResponse = {
            success: true,
            message: "University updated successfully",
            data: university,
        };

        res.json(response);
    }
);

// Delete university (Admin only)
export const deleteUniversity = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        await prisma.university.delete({
            where: { id },
        });

        const response: ApiResponse = {
            success: true,
            message: "University deleted successfully",
        };

        res.json(response);
    }
);
