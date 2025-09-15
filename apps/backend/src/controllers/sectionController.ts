import { Request, Response } from "express";
import prisma from "@repo/db";
import { asyncHandler } from "../middleware/index";
import { ApiResponse } from "../types";

// Assign student to a section (when user status becomes STUDENT)
export const assignStudentToSection = asyncHandler(
    async (req: Request, res: Response) => {
        const { studentId, sectionId } = req.body;

        // Verify the user is a student
        const user = await prisma.user.findUnique({
            where: { id: studentId },
            include: {
                enrollments: {
                    include: {
                        course: true,
                        semester: true,
                        academicYear: true,
                    },
                },
            },
        });

        if (!user || user.role !== "STUDENT") {
            return res.status(400).json({
                success: false,
                message: "User must be a student to be assigned to a section",
            });
        }

        // Verify the section exists and get its details
        const section = await prisma.section.findUnique({
            where: { id: sectionId },
            include: {
                course: true,
                semester: true,
                academicYear: true,
                _count: {
                    select: { sectionEnrollments: true },
                },
            },
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            });
        }

        // Check if section has capacity
        if (section.currentStudents >= section.maxStudents) {
            return res.status(400).json({
                success: false,
                message: "Section is at full capacity",
            });
        }

        // Find the student's enrollment for this course/semester/academic year
        const enrollment = user.enrollments.find(
            (e) =>
                e.courseId === section.courseId &&
                e.semesterId === section.semesterId &&
                e.academicYearId === section.academicYearId
        );

        if (!enrollment) {
            return res.status(400).json({
                success: false,
                message:
                    "Student is not enrolled in this course/semester/academic year",
            });
        }

        // Check if student is already assigned to a section for this enrollment
        const existingAssignment = await prisma.sectionEnrollment.findFirst({
            where: {
                studentId,
                enrollmentId: enrollment.id,
            },
        });

        if (existingAssignment) {
            return res.status(400).json({
                success: false,
                message:
                    "Student is already assigned to a section for this enrollment",
            });
        }

        // Create section enrollment
        const sectionEnrollment = await prisma.sectionEnrollment.create({
            data: {
                studentId,
                sectionId,
                enrollmentId: enrollment.id,
                status: "ACTIVE",
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                section: {
                    include: {
                        course: true,
                        semester: true,
                        academicYear: true,
                    },
                },
            },
        });

        // Update section current students count
        await prisma.section.update({
            where: { id: sectionId },
            data: {
                currentStudents: {
                    increment: 1,
                },
            },
        });

        const response = {
            success: true,
            message: "Student assigned to section successfully",
            data: sectionEnrollment,
        };

        res.status(201).json(response);
    }
);

// Assign professor to a section
export const assignProfessorToSection = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            professorId,
            sectionId,
            subjectId,
            assignmentType = "INSTRUCTOR",
            permissions = {},
        } = req.body;

        // Verify the user is a professor
        const professor = await prisma.user.findUnique({
            where: { id: professorId },
        });

        if (!professor || professor.role !== "PROFESSOR") {
            return res.status(400).json({
                success: false,
                message: "User must be a professor to be assigned to a section",
            });
        }

        // Verify section exists
        const section = await prisma.section.findUnique({
            where: { id: sectionId },
            include: {
                course: true,
                semester: true,
            },
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            });
        }

        // Verify subject exists and belongs to the same semester
        if (subjectId) {
            const subject = await prisma.subject.findUnique({
                where: { id: subjectId },
            });

            if (!subject || subject.semesterId !== section.semesterId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Subject not found or doesn't belong to this section's semester",
                });
            }
        }

        // Check if professor is already assigned to this section for this subject
        const existingAssignment =
            await prisma.professorSectionAssignment.findFirst({
                where: {
                    professorId,
                    sectionId,
                    subjectId: subjectId || null,
                },
            });

        if (existingAssignment) {
            return res.status(400).json({
                success: false,
                message:
                    "Professor is already assigned to this section for this subject",
            });
        }

        // Create professor section assignment
        const assignment = await prisma.professorSectionAssignment.create({
            data: {
                professorId,
                sectionId,
                subjectId: subjectId || null,
                assignmentType: assignmentType as any,
                canMarkAttendance: permissions.canMarkAttendance ?? true,
                canCreateResources: permissions.canCreateResources ?? true,
                canConductLiveClasses:
                    permissions.canConductLiveClasses ?? true,
                isActive: true,
            },
            include: {
                professor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                section: {
                    include: {
                        course: true,
                        semester: true,
                    },
                },
                subject: true,
            },
        });

        res.status(201).json({
            success: true,
            message: "Professor assigned to section successfully",
            data: assignment,
        });
    }
);

// Get all sections (Admin overview)
export const getAllSections = asyncHandler(
    async (req: Request, res: Response) => {
        const { universityId, courseId, semesterId, academicYearId } =
            req.query;

        const sections = await prisma.section.findMany({
            where: {
                ...(universityId && {
                    course: {
                        universityId: universityId as string,
                    },
                }),
                ...(courseId && { courseId: courseId as string }),
                ...(semesterId && { semesterId: semesterId as string }),
                ...(academicYearId && {
                    academicYearId: academicYearId as string,
                }),
            },
            include: {
                course: {
                    include: {
                        university: true,
                    },
                },
                semester: true,
                academicYear: true,
                _count: {
                    select: {
                        sectionEnrollments: true,
                        professorAssignments: true,
                    },
                },
                professorAssignments: {
                    where: { isActive: true },
                    include: {
                        professor: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        subject: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                    },
                },
            },
            orderBy: [
                { course: { name: "asc" } },
                { semester: { number: "asc" } },
                { code: "asc" },
            ],
        });

        res.json({
            success: true,
            message: "Sections retrieved successfully",
            data: sections,
        });
    }
);

// Get professor's assigned sections
export const getProfessorSections = asyncHandler(
    async (req: Request, res: Response) => {
        const { professorId } = req.params;

        const assignments = await prisma.professorSectionAssignment.findMany({
            where: {
                professorId,
                isActive: true,
            },
            include: {
                section: {
                    include: {
                        course: true,
                        semester: true,
                        academicYear: true,
                        _count: {
                            select: { sectionEnrollments: true },
                        },
                    },
                },
                subject: true,
            },
            orderBy: [
                { section: { course: { name: "asc" } } },
                { section: { semester: { number: "asc" } } },
                { section: { code: "asc" } },
            ],
        });

        res.json({
            success: true,
            message: "Professor sections retrieved successfully",
            data: assignments,
        });
    }
);

// Get student's section assignments
export const getStudentSections = asyncHandler(
    async (req: Request, res: Response) => {
        const { studentId } = req.params;

        const sectionEnrollments = await prisma.sectionEnrollment.findMany({
            where: {
                studentId,
                status: "ACTIVE",
            },
            include: {
                section: {
                    include: {
                        course: true,
                        semester: true,
                        academicYear: true,
                    },
                },
                enrollment: {
                    include: {
                        course: true,
                        semester: true,
                    },
                },
            },
        });

        res.json({
            success: true,
            message: "Student sections retrieved successfully",
            data: sectionEnrollments,
        });
    }
);

// Create a new section
export const createSection = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            name,
            code,
            description,
            courseId,
            semesterId,
            academicYearId,
            maxStudents = 60,
            startTime,
            endTime,
        } = req.body;

        // Check if section with same code already exists for this course/semester/academic year
        const existingSection = await prisma.section.findFirst({
            where: {
                courseId,
                semesterId,
                academicYearId,
                code,
            },
        });

        if (existingSection) {
            return res.status(400).json({
                success: false,
                message:
                    "Section with this code already exists for this course/semester/academic year",
            });
        }

        const section = await prisma.section.create({
            data: {
                name,
                code,
                description,
                courseId,
                semesterId,
                academicYearId,
                maxStudents,
                currentStudents: 0,
                startTime: startTime ? new Date(startTime) : null,
                endTime: endTime ? new Date(endTime) : null,
                isActive: true,
            },
            include: {
                course: true,
                semester: true,
                academicYear: true,
            },
        });

        res.status(201).json({
            success: true,
            message: "Section created successfully",
            data: section,
        });
    }
);
