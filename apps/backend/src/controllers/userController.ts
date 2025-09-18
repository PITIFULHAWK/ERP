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
            enrollments: {
                include: {
                    course: true,
                    semester: true,
                    academicYear: true,
                },
            },
            hostelOpted: true,
            application: {
                include: {
                    preferredCourse: true,
                    documents: true,
                },
            },
        },
    });

    res.json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
    });
});

// Get user by ID
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            university: true,
            enrollments: {
                include: {
                    course: true,
                    semester: true,
                    academicYear: true,
                },
            },
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
        return res.status(404).json({
            success: false,
            message: "User not found",
            error: "Not Found",
        });
    }

    res.json({
        success: true,
        message: "User retrieved successfully",
        data: user,
    });
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

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            university: true,
            application: {
                include: {
                    preferredCourse: true,
                    documents: true,
                    verifiedBy: true,
                },
            },
        },
    });

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

    // Get current semester information if user is a student
    let currentSemesterInfo = null;
    let cgpa = 0;
    let academicRecord = null;

    if (user.role === "STUDENT") {
        const { getCurrentSemesterForStudent } = await import(
            "../utils/semesterUtils"
        );
        const { calculateStudentCGPA, getStudentAcademicRecord } = await import(
            "../utils/cgpaCalculator"
        );

        currentSemesterInfo = await getCurrentSemesterForStudent(user.id);
        cgpa = await calculateStudentCGPA(user.id);
        academicRecord = await getStudentAcademicRecord(user.id);
    }

    res.json({
        success: true,
        message: "Login successful",
        data: {
            token,
            user: {
                ...user,
                password: undefined, // Remove password from response
                currentSemesterInfo,
                cgpa,
                academicRecord,
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

        res.json({
            success: true,
            message: `User role successfully updated to ${newRole}`,
            data: updatedUser,
        });
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

    res.json({
        success: true,
        message: "User updated successfully",
        data: user,
    });
});

// Delete user
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.user.delete({
        where: { id },
    });

    res.json({
        success: true,
        message: "User deleted successfully",
    });
});

// Get current user profile with calculated CGPA
export const getUserProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                university: true,
                hostelOpted: true,
                application: {
                    include: {
                        preferredCourse: true,
                        documents: true,
                    },
                },
                enrollments: {
                    include: {
                        course: true,
                        semester: true,
                        academicYear: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Calculate CGPA if user is a student
        let cgpa = 0;
        let academicRecord = null;

        if (user.role === "STUDENT") {
            const { calculateStudentCGPA, getStudentAcademicRecord } =
                await import("../utils/cgpaCalculator");
            cgpa = await calculateStudentCGPA(userId);
            academicRecord = await getStudentAcademicRecord(userId);
        }

        res.json({
            success: true,
            message: "User profile retrieved successfully",
            data: {
                ...user,
                cgpa,
                academicRecord,
            },
        });
    }
);

// Update current user profile
export const updateUserProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;
        const { name, email } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        // Check if email is being changed and if it's already taken
        if (email) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    email,
                    id: { not: userId },
                },
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Email is already taken by another user",
                });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(email && { email }),
            },
            include: {
                university: true,
                enrollments: {
                    include: {
                        course: true,
                        semester: true,
                        academicYear: true,
                    },
                },
                hostelOpted: true,
            },
        });

        // Calculate CGPA if user is a student
        let cgpa = 0;
        let academicRecord = null;

        if (updatedUser.role === "STUDENT") {
            const { calculateStudentCGPA, getStudentAcademicRecord } =
                await import("../utils/cgpaCalculator");
            cgpa = await calculateStudentCGPA(userId);
            academicRecord = await getStudentAcademicRecord(userId);
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: {
                ...updatedUser,
                cgpa,
                academicRecord,
            },
        });
    }
);

// Get current semester for a student
export const getCurrentSemester = asyncHandler(
    async (req: Request, res: Response) => {
        const { studentId } = req.params;
        const requestingUserId = (req as any).user?.id;
        const requestingUserRole = (req as any).user?.role;

        // Students can only get their own semester info, others can get any student's
        if (
            requestingUserRole === "STUDENT" &&
            requestingUserId !== studentId
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only view your own semester information",
            });
        }

        const { getCurrentSemesterForStudent } = await import(
            "../utils/semesterUtils"
        );
        const semesterInfo = await getCurrentSemesterForStudent(studentId);

        if (!semesterInfo) {
            return res.status(404).json({
                success: false,
                message: "No active enrollment found for this student",
            });
        }

        res.json({
            success: true,
            message: "Current semester information retrieved successfully",
            data: semesterInfo,
        });
    }
);

// Get semester progress for a student
export const getSemesterProgress = asyncHandler(
    async (req: Request, res: Response) => {
        const { studentId } = req.params;
        const requestingUserId = (req as any).user?.id;
        const requestingUserRole = (req as any).user?.role;

        // Students can only get their own progress, others can get any student's
        if (
            requestingUserRole === "STUDENT" &&
            requestingUserId !== studentId
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only view your own semester progress",
            });
        }

        const { getStudentSemesterProgress } = await import(
            "../utils/semesterUtils"
        );
        const progress = await getStudentSemesterProgress(studentId);

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: "No enrollment data found for this student",
            });
        }

        res.json({
            success: true,
            message: "Semester progress retrieved successfully",
            data: progress,
        });
    }
);

// Update student's current semester (Admin/Professor only)
export const updateCurrentSemester = asyncHandler(
    async (req: Request, res: Response) => {
        const { studentId } = req.params;
        const { currentSemester } = req.body;
        const requestingUserRole = (req as any).user?.role;

        // Only admins and professors can update semester
        if (!["ADMIN", "PROFESSOR"].includes(requestingUserRole)) {
            return res.status(403).json({
                success: false,
                message:
                    "Only admins and professors can update student semesters",
            });
        }

        if (!currentSemester || currentSemester < 1) {
            return res.status(400).json({
                success: false,
                message: "Valid current semester number is required",
            });
        }

        try {
            const { updateStudentCurrentSemester } = await import(
                "../utils/semesterUtils"
            );
            const updatedEnrollment = await updateStudentCurrentSemester(
                studentId,
                currentSemester
            );

            res.json({
                success: true,
                message: "Student semester updated successfully",
                data: updatedEnrollment,
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to update student semester",
            });
        }
    }
);
