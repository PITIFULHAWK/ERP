import { Request, Response, NextFunction } from "express";
import prisma from "@repo/db";
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
