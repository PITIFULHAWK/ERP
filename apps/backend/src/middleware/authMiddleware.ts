import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "@repo/db";
import { asyncHandler } from "./index"; // Assuming asyncHandler is in its own file now

// Extend the Express Request type to include the user property
interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const requireAuth = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required: No token provided.",
                error: "Unauthorized",
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "your-default-secret"
        ) as { id: string; role: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, role: true },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed: User not found.",
                error: "Unauthorized",
            });
        }

        req.user = user;
        next();
    }
);

export const requireAdmin = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        // This middleware now runs *after* requireAuth, so req.user is available
        if (!req.user || req.user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Admin access required.",
                error: "Forbidden",
            });
        }
        next();
    }
);

export const requireStaff = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        const allowedRoles = ["ADMIN", "PROFESSOR", "VERIFIER"];

        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Staff access required.",
                error: "Forbidden",
            });
        }
        next();
    }
);
