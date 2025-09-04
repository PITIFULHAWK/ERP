import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  const response: ApiResponse = {
    success: false,
    message: "Internal Server Error",
    error: err.message || "Something went wrong!",
  };

  res.status(500).json(response);
};

export const notFound = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: "Not Found",
  };

  res.status(404).json(response);
};

// Middleware to check if user is admin by checking user role in database
export const requireAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: "User ID is required",
        error: "Missing user ID in headers",
      };
      return res.status(401).json(response);
    }

    try {
      // Import prisma here to avoid circular dependency
      const { prisma } = await import("@repo/db");

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, name: true },
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: "User not found",
          error: "Invalid user ID",
        };
        return res.status(404).json(response);
      }

      if (user.role !== "ADMIN") {
        const response: ApiResponse = {
          success: false,
          message: "Admin access required",
          error: `User role is ${user.role}, but ADMIN role is required`,
        };
        return res.status(403).json(response);
      }

      // Add user info to request for use in controllers if needed
      (req as any).user = user;
      next();
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Error checking user permissions",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      return res.status(500).json(response);
    }
  }
);
