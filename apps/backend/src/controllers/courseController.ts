import { Request, Response } from "express";
import prisma from "@repo/db";
import { CreateCourseRequest, ApiResponse } from "../types";
import { asyncHandler } from "../middleware";

// Get all courses
export const getCourses = asyncHandler(async (req: Request, res: Response) => {
    const { universityId } = req.query;

    const courses = await prisma.course.findMany({
        where: universityId ? { universityId: universityId as string } : {},
        include: {
            university: true,
            _count: {
                select: {
                    enrollments: true,
                    applications: true,
                },
            },
        },
    });

    const response: ApiResponse = {
        success: true,
        message: "Courses retrieved successfully",
        data: courses,
    };

    res.json(response);
});

// Get course by ID
export const getCourseById = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                university: true,
                enrollments: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            },
                        },
                        semester: true,
                        academicYear: true,
                    },
                },
                applications: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!course) {
            const response: ApiResponse = {
                success: false,
                message: "Course not found",
                error: "Not Found",
            };
            return res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: true,
            message: "Course retrieved successfully",
            data: course,
        };

        res.json(response);
    }
);

// Create course (Admin only)
export const createCourse = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            name,
            code,
            credits,
            totalSemester,
            totalFees,
            universityId,
        }: CreateCourseRequest = req.body;

        // Check if course with same code exists
        const existingCourse = await prisma.course.findUnique({
            where: { code },
        });

        if (existingCourse) {
            const response: ApiResponse = {
                success: false,
                message: "Course with this code already exists",
                error: "Conflict",
            };
            return res.status(409).json(response);
        }

        const course = await prisma.course.create({
            data: {
                name,
                code,
                credits,
                totalSemester,
                totalFees,
                universityId,
            },
            include: {
                university: true,
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Course created successfully",
            data: course,
        };

        res.status(201).json(response);
    }
);

// Update course (Admin only)
export const updateCourse = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const updateData = req.body;

        const course = await prisma.course.update({
            where: { id },
            data: updateData,
            include: {
                university: true,
            },
        });

        const response: ApiResponse = {
            success: true,
            message: "Course updated successfully",
            data: course,
        };

        res.json(response);
    }
);

// Delete course (Admin only)
export const deleteCourse = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        await prisma.course.delete({
            where: { id },
        });

        const response: ApiResponse = {
            success: true,
            message: "Course deleted successfully",
        };

        res.json(response);
    }
);

export const enrollStudentInCourse = asyncHandler(
    async (req: Request, res: Response) => {
        const { courseId, userId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                Application: true, // Include application data
            },
        });

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        // Ensure only users with the 'USER' role can be promoted to 'STUDENT'
        if (user.role !== "USER") {
            return res.status(400).json({
                success: false,
                message:
                    "This user cannot be enrolled as they are not a basic user.",
            });
        }

        // Check if user has an application
        if (!user.Application) {
            return res.status(400).json({
                success: false,
                message: "User must have an application before enrollment.",
            });
        }

        // Check if application is for the correct course
        if (user.Application.preferredCourseId !== courseId) {
            return res.status(400).json({
                success: false,
                message: "User's application is not for this course.",
            });
        }

        // Check if application status is VERIFIED
        if (user.Application.status !== "VERIFIED") {
            return res.status(400).json({
                success: false,
                message: `Cannot enroll student. Application status is ${user.Application.status}. Only students with VERIFIED applications can be enrolled.`,
                data: {
                    currentStatus: user.Application.status,
                    requiredStatus: "VERIFIED",
                    applicationId: user.Application.id,
                },
            });
        }

        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Use a transaction to ensure all database operations succeed or fail together
        // Get the active academic year for the university
        const activeAcademicYear = await prisma.academicYear.findFirst({
            where: {
                universityId: user.universityId,
                isActive: true,
            },
        });

        if (!activeAcademicYear) {
            return res.status(400).json({
                success: false,
                message: "No active academic year found for the university",
            });
        }

        // Get the first semester of the course
        const firstSemester = await prisma.semester.findFirst({
            where: {
                courseId: courseId,
                number: 1,
            },
        });

        if (!firstSemester) {
            return res.status(400).json({
                success: false,
                message: "No first semester found for this course",
            });
        }

        const [updatedUser, updatedCourse, studentEnrollment] =
            await prisma.$transaction([
                // Promote user to STUDENT
                prisma.user.update({
                    where: { id: userId },
                    data: {
                        role: "STUDENT", // Promote user to STUDENT
                    },
                    include: {
                        Application: true,
                        enrollments: {
                            include: {
                                course: true,
                                semester: true,
                                academicYear: true,
                            },
                        },
                    },
                }),
                // Update course student count
                prisma.course.update({
                    where: { id: courseId },
                    data: {
                        currentStudents: {
                            increment: 1, // Increment the student count on the course
                        },
                    },
                }),
                // Create StudentEnrollment record
                prisma.studentEnrollment.create({
                    data: {
                        studentId: userId,
                        courseId: courseId,
                        semesterId: firstSemester.id,
                        academicYearId: activeAcademicYear.id,
                        currentSemester: 1, // Starting with first semester
                        status: "ACTIVE",
                    },
                    include: {
                        course: true,
                        semester: true,
                        academicYear: true,
                    },
                }),
            ]);

        const response: ApiResponse = {
            success: true,
            message: `User ${updatedUser.name} successfully enrolled and promoted to STUDENT based on verified application.`,
            data: {
                user: updatedUser,
                course: updatedCourse,
                enrollment: studentEnrollment,
                applicationId: updatedUser.Application?.id,
                enrollmentDate: studentEnrollment.enrollmentDate,
            },
        };

        res.json(response);
    }
);
