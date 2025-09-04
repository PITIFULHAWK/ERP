import { Request, Response } from "express";
import { prisma } from "@repo/db";
import { CreateUserRequest, ApiResponse } from "../types";
import { asyncHandler } from "../middleware";

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

// Create user
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    email,
    role = "USER",
    universityId,
  }: CreateUserRequest = req.body;

  // Check if user with same email exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const response: ApiResponse = {
      success: false,
      message: "User with this email already exists",
      error: "Conflict",
    };
    return res.status(409).json(response);
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
      universityId,
    },
    include: {
      university: true,
    },
  });

  const response: ApiResponse = {
    success: true,
    message: "User created successfully",
    data: user,
  };

  res.status(201).json(response);
});

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
