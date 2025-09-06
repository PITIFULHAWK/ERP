import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiResponse } from "../types";

export const validateRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const response: ApiResponse = {
            success: false,
            message: "Validation failed",
            error: errors.array()[0].msg, // Send back the first error message
        };
        return res.status(400).json(response);
    }
    next();
};
