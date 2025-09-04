import { Request, Response } from "express";
import { prisma } from "@repo/db";
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
