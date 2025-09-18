import prisma from "@repo/db";

/**
 * Get current semester information for a student
 */
export async function getCurrentSemesterForStudent(studentId: string) {
    try {
        // Get the student's active enrollment
        const enrollment = await prisma.studentEnrollment.findFirst({
            where: {
                studentId,
                status: "ACTIVE",
            },
            include: {
                semester: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                                totalSemester: true,
                            },
                        },
                    },
                },
                academicYear: {
                    select: {
                        id: true,
                        year: true,
                        startDate: true,
                        endDate: true,
                        isActive: true,
                    },
                },
                course: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        totalSemester: true,
                    },
                },
            },
        });

        if (!enrollment) {
            return null; // No active enrollment found
        }

        return {
            currentSemester: enrollment.currentSemester,
            semesterInfo: enrollment.semester,
            academicYear: enrollment.academicYear,
            course: enrollment.course,
            enrollmentStatus: enrollment.status,
            totalCredits: enrollment.totalCredits,
            completedCredits: enrollment.completedCredits,
            cgpa: enrollment.cgpa,
            enrollmentDate: enrollment.enrollmentDate,
        };
    } catch (error) {
        console.error("Error getting current semester for student:", error);
        return null;
    }
}

/**
 * Get detailed semester progression for a student
 */
export async function getStudentSemesterProgress(studentId: string) {
    try {
        const enrollments = await prisma.studentEnrollment.findMany({
            where: {
                studentId,
            },
            include: {
                semester: {
                    include: {
                        course: true,
                    },
                },
                academicYear: true,
                course: true,
            },
            orderBy: {
                currentSemester: "asc",
            },
        });

        const activeEnrollment = enrollments.find((e) => e.status === "ACTIVE");

        return {
            allEnrollments: enrollments,
            activeEnrollment,
            totalSemesters: activeEnrollment?.course?.totalSemester || 0,
            currentSemester: activeEnrollment?.currentSemester || 0,
            progressPercentage: activeEnrollment
                ? Math.round(
                      (activeEnrollment.currentSemester /
                          (activeEnrollment.course.totalSemester || 1)) *
                          100
                  )
                : 0,
        };
    } catch (error) {
        console.error("Error getting student semester progress:", error);
        return null;
    }
}

/**
 * Update student's current semester
 */
export async function updateStudentCurrentSemester(
    studentId: string,
    newSemester: number
) {
    try {
        const enrollment = await prisma.studentEnrollment.findFirst({
            where: {
                studentId,
                status: "ACTIVE",
            },
        });

        if (!enrollment) {
            throw new Error("No active enrollment found for student");
        }

        const updatedEnrollment = await prisma.studentEnrollment.update({
            where: {
                id: enrollment.id,
            },
            data: {
                currentSemester: newSemester,
            },
            include: {
                semester: true,
                academicYear: true,
                course: true,
            },
        });

        return updatedEnrollment;
    } catch (error) {
        console.error("Error updating student current semester:", error);
        throw error;
    }
}
