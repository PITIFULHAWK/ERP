import { Request, Response } from "express";
import prisma from "@repo/db";
import { CreateUserRequest, ApiResponse } from "../types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../middleware/index";

// Get all users
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
    const { role, universityId } = req.query;

    const users = await prisma.user.findMany({
        where: {
            ...(role && { role: role as any }),
            ...(universityId && { universityId: universityId as string }),
        },
        include: {
            university: true,
            coursesOpted: true,
            hostelOpted: true,
            application: {
                include: {
                    preferredCourse: true,
                    documents: true,
                },
            },
        },
    });

    const response: ApiResponse = {
        success: true,
        message: "Users retrieved successfully",
        data: users,
    };

    res.json(response);
});

// Get user by ID
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            university: true,
            coursesOpted: true,
            hostelOpted: true,
            application: {
                include: {
                    preferredCourse: true,
                    documents: true,
                    verifiedBy: true,
                },
            },
        },
    });

    if (!user) {
        const response: ApiResponse = {
            success: false,
            message: "User not found",
            error: "Not Found",
        };
        return res.status(404).json(response);
    }

    const response: ApiResponse = {
        success: true,
        message: "User retrieved successfully",
        data: user,
    };

    res.json(response);
});

// Create user (with password hashing)
export const createUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, universityId } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "User with this email already exists",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            universityId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            university: true,
        },
    });

    res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
    });
});

// User Login
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
        return res
            .status(401)
            .json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res
            .status(401)
            .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
        { id: user.id, role: user.role, universityId: user.universityId },
        process.env.JWT_SECRET || "your-default-secret",
        { expiresIn: "1d" }
    );

    res.json({
        success: true,
        message: "Login successful",
        data: {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        },
    });
});
// Create admin user function is now removed.

// New function to handle complex role updates
export const updateUserRole = asyncHandler(
    async (req: Request, res: Response) => {
        const { id: targetUserId } = req.params;
        const { role: newRole } = req.body;
        const requestingUser = (req as any).user; // Attached by requireAuth middleware

        // Rule: Users cannot change their own role
        if (requestingUser.id === targetUserId) {
            return res.status(403).json({
                success: false,
                message: "Forbidden",
                error: "Users cannot update their own role.",
            });
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
        });

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User to update not found",
            });
        }

        let isAuthorized = false;

        // RBAC Logic
        switch (requestingUser.role) {
            case "ADMIN":
                // Admins can assign any role
                isAuthorized = true;
                break;

            case "PROFESSOR":
                // Professors can assign any role except ADMIN
                if (newRole !== "ADMIN") {
                    isAuthorized = true;
                }
                break;

            case "VERIFIER":
                // Verifiers can only upgrade a USER to a STUDENT
                if (targetUser.role === "USER" && newRole === "STUDENT") {
                    isAuthorized = true;
                }
                break;

            default:
                // Other roles (USER, STUDENT) have no permission
                isAuthorized = false;
                break;
        }

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "Forbidden",
                error: "You do not have permission to perform this action.",
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: { role: newRole },
        });

        const response: ApiResponse = {
            success: true,
            message: `User role successfully updated to ${newRole}`,
            data: updatedUser,
        };

        res.json(response);
    }
);

// Update user
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const user = await prisma.user.update({
        where: { id },
        data: updateData,
        include: {
            university: true,
            application: true,
        },
    });

    const response: ApiResponse = {
        success: true,
        message: "User updated successfully",
        data: user,
    };

    res.json(response);
});

// Delete user
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.user.delete({
        where: { id },
    });

    const response: ApiResponse = {
        success: true,
        message: "User deleted successfully",
    };

    res.json(response);
});
