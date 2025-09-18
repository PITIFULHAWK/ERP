import { Request, Response } from "express";
import prisma from "@repo/db";
import { asyncHandler } from "../middleware/index";

// Mark attendance for students in a section
export const markAttendance = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            professorId,
            sectionId,
            subjectId,
            date,
            attendanceData, // Array of { studentId, status }
            classType = "REGULAR",
        } = req.body;

        // Verify professor has permission to mark attendance for this section
        const assignment = await prisma.professorSectionAssignment.findFirst({
            where: {
                professorId,
                sectionId,
                subjectId: subjectId || null,
                isActive: true,
                canMarkAttendance: true,
            },
        });

        if (!assignment) {
            return res.status(403).json({
                success: false,
                message:
                    "Professor does not have permission to mark attendance for this section/subject",
            });
        }

        // Verify section exists
        const section = await prisma.section.findUnique({
            where: { id: sectionId },
            include: { academicYear: true },
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            });
        }

        const attendanceDate = new Date(date);
        const results = [];
        const errors = [];

        // Process each student's attendance
        for (const { studentId, status } of attendanceData) {
            try {
                // Check if student is enrolled in this section
                const sectionEnrollment =
                    await prisma.sectionEnrollment.findFirst({
                        where: {
                            studentId,
                            sectionId,
                            status: "ACTIVE",
                        },
                        include: { enrollment: true },
                    });

                if (!sectionEnrollment) {
                    errors.push({
                        studentId,
                        error: "Student not enrolled in this section",
                    });
                    continue;
                }

                // Check if attendance already marked for this date
                const existingAttendance = await prisma.attendance.findFirst({
                    where: {
                        studentId,
                        subjectId,
                        sectionId,
                        date: {
                            gte: new Date(
                                attendanceDate.getFullYear(),
                                attendanceDate.getMonth(),
                                attendanceDate.getDate()
                            ),
                            lt: new Date(
                                attendanceDate.getFullYear(),
                                attendanceDate.getMonth(),
                                attendanceDate.getDate() + 1
                            ),
                        },
                    },
                });

                if (existingAttendance) {
                    // Update existing attendance
                    const updated = await prisma.attendance.update({
                        where: { id: existingAttendance.id },
                        data: {
                            status: status as any,
                            markedAt: new Date(),
                            markedBy: professorId,
                        },
                        include: {
                            enrollment: {
                                include: {
                                    student: {
                                        select: { id: true, name: true, email: true },
                                    },
                                },
                            },
                        },
                    });
                    results.push(updated);
                } else {
                    // Create new attendance record
                    const attendance = await prisma.attendance.create({
                        data: {
                            studentId,
                            enrollmentId: sectionEnrollment.enrollmentId,
                            subjectId,
                            sectionId,
                            date: attendanceDate,
                            classType: classType as any,
                            status: status as any,
                            markedAt: new Date(),
                            markedBy: professorId,
                            academicYearId: section.academicYearId,
                        },
                        include: {
                            enrollment: {
                                include: {
                                    student: {
                                        select: { id: true, name: true, email: true },
                                    },
                                },
                            },
                        },
                    });
                    results.push(attendance);
                }
            } catch (error) {
                errors.push({
                    studentId,
                    error: "Failed to mark attendance",
                });
            }
        }

        // Update attendance summaries for affected students
        await updateAttendanceSummaries(
            results.map((r) => r.studentId),
            subjectId,
            section.academicYearId
        );

        res.json({
            success: true,
            message: `Attendance marked for ${results.length} students`,
            data: {
                marked: results,
                errors: errors.length > 0 ? errors : undefined,
            },
        });
    }
);

// Get student's attendance by subject and semester
export const getStudentAttendance = asyncHandler(
    async (req: Request, res: Response) => {
        const { studentId } = req.params;
        const { subjectId, semesterId, academicYearId } = req.query;

        const whereClause: any = {
            studentId,
        };

        if (subjectId) whereClause.subjectId = subjectId;
        if (academicYearId) whereClause.academicYearId = academicYearId;
        if (semesterId) {
            whereClause.enrollment = {
                semesterId: semesterId as string,
            };
        }

        // Get detailed attendance records
        const attendanceRecords = await prisma.attendance.findMany({
            where: whereClause,
            include: {
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        credits: true,
                    },
                },
                section: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                markedByUser: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: [{ date: "desc" }, { subject: { code: "asc" } }],
        });

        // Get attendance summaries
        const summaries = await prisma.attendanceSummary.findMany({
            where: {
                studentId,
                ...(subjectId && { subjectId: subjectId as string }),
                ...(academicYearId && {
                    academicYearId: academicYearId as string,
                }),
                ...(semesterId && {
                    enrollment: {
                        semesterId: semesterId as string,
                    },
                }),
            },
            include: {
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        credits: true,
                    },
                },
            },
        });

        res.json({
            success: true,
            message: "Student attendance retrieved successfully",
            data: {
                records: attendanceRecords,
                summaries: summaries,
            },
        });
    }
);

// Get attendance for a section (Professor view)
export const getSectionAttendance = asyncHandler(
    async (req: Request, res: Response) => {
        const { sectionId } = req.params;
        const { subjectId, date, academicYearId } = req.query;

        let whereClause: any = {
            sectionId,
        };

        if (subjectId) whereClause.subjectId = subjectId;
        if (academicYearId) whereClause.academicYearId = academicYearId;
        if (date) {
            const queryDate = new Date(date as string);
            whereClause.date = {
                gte: new Date(
                    queryDate.getFullYear(),
                    queryDate.getMonth(),
                    queryDate.getDate()
                ),
                lt: new Date(
                    queryDate.getFullYear(),
                    queryDate.getMonth(),
                    queryDate.getDate() + 1
                ),
            };
        }

        const attendanceRecords = await prisma.attendance.findMany({
            where: whereClause,
            include: {
                enrollment: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
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
            orderBy: [{ date: "desc" }, { enrollment: { student: { name: "asc" } } }],
        });

        // If specific date is requested, also get all students in section who don't have attendance marked
        let studentsWithoutAttendance: Array<{
            id: string;
            name: string;
            email: string;
        }> = [];
        if (date && subjectId) {
            const allStudentsInSection =
                await prisma.sectionEnrollment.findMany({
                    where: {
                        sectionId,
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
                    },
                });

            const studentsWithAttendance = attendanceRecords.map(
                (a) => a.studentId
            );
            studentsWithoutAttendance = allStudentsInSection
                .filter(
                    (enrollment) =>
                        !studentsWithAttendance.includes(enrollment.studentId)
                )
                .map((enrollment) => enrollment.student);
        }

        res.json({
            success: true,
            message: "Section attendance retrieved successfully",
            data: {
                records: attendanceRecords,
                studentsWithoutAttendance,
            },
        });
    }
);

// Get attendance statistics for a section
export const getSectionAttendanceStats = asyncHandler(
    async (req: Request, res: Response) => {
        const { sectionId } = req.params;
        const { academicYearId, subjectId } = req.query;

        let whereClause: any = { sectionId };
        if (academicYearId) whereClause.academicYearId = academicYearId;
        if (subjectId) whereClause.subjectId = subjectId;

        // Get total classes and attendance statistics
        const stats = await prisma.attendance.groupBy({
            by: ["studentId"],
            where: whereClause,
            _count: {
                _all: true,
            },
        });

        // Get detailed stats by status
        const statusStats = await prisma.attendance.groupBy({
            by: ["studentId", "status"],
            where: whereClause,
            _count: {
                _all: true,
            },
        });

        // Get student details
        const studentIds = stats.map((s) => s.studentId);
        const students = await prisma.user.findMany({
            where: {
                id: { in: studentIds },
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        // Combine the data
        const attendanceStats = students.map((student) => {
            const studentStats = statusStats.filter(
                (s) => s.studentId === student.id
            );
            const totalClasses =
                stats.find((s) => s.studentId === student.id)?._count._all || 0;

            const present =
                studentStats.find((s) => s.status === "PRESENT")?._count._all ||
                0;
            const absent =
                studentStats.find((s) => s.status === "ABSENT")?._count._all ||
                0;

            const attendancePercentage =
                totalClasses > 0 ? (present / totalClasses) * 100 : 0;

            return {
                student,
                totalClasses,
                present,
                absent,
                attendancePercentage:
                    Math.round(attendancePercentage * 100) / 100,
            };
        });

        res.json({
            success: true,
            message: "Section attendance statistics retrieved successfully",
            data: attendanceStats,
        });
    }
);

// Helper function to update attendance summaries
async function updateAttendanceSummaries(
    studentIds: string[],
    subjectId: string,
    academicYearId: string
) {
    for (const studentId of studentIds) {
        // Get all attendance for this student/subject/academic year
        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                studentId,
                subjectId,
                academicYearId,
            },
        });

        const totalClasses = attendanceRecords.length;
        const presentClasses = attendanceRecords.filter(
            (a) => a.status === "PRESENT"
        ).length;
        const absentClasses = attendanceRecords.filter(
            (a) => a.status === "ABSENT"
        ).length;
        const attendancePercentage =
            totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

        // Get the student's enrollment
        const enrollment = await prisma.studentEnrollment.findFirst({
            where: {
                studentId,
                academicYearId,
            },
        });

        if (enrollment) {
            // Update or create attendance summary
            await prisma.attendanceSummary.upsert({
                where: {
                    studentId_subjectId_academicYearId: {
                        studentId,
                        subjectId,
                        academicYearId,
                    },
                },
                update: {
                    totalClasses,
                    presentClasses,
                    absentClasses,
                    attendancePercentage:
                        Math.round(attendancePercentage * 100) / 100,
                    toDate: new Date(),
                },
                create: {
                    studentId,
                    enrollmentId: enrollment.id,
                    subjectId,
                    academicYearId,
                    totalClasses,
                    presentClasses,
                    absentClasses,
                    attendancePercentage:
                        Math.round(attendancePercentage * 100) / 100,
                    fromDate: attendanceRecords[0]?.date || new Date(),
                    toDate: new Date(),
                },
            });
        }
    }
}
