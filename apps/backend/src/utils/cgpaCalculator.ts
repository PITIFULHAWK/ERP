import prisma from "@repo/db";

/**
 * Calculate CGPA for a student based on their exam results
 * CGPA = (Sum of (Grade Points × Credits)) / (Total Credits)
 * Uses 10.0 scale for grade point calculation
 */
export async function calculateStudentCGPA(studentId: string): Promise<number> {
    try {
        const examResults = await getExamResultsWithSubjects(studentId);

        if (examResults.length === 0) {
            return 0; // No exam results available
        }

        return calculateGPAFromResults(examResults);
    } catch (error) {
        console.error("Error calculating CGPA:", error);
        return 0;
    }
}

/**
 * Calculate semester-wise GPA for a student
 */
export async function calculateSemesterGPA(
    studentId: string,
    semesterId: string
): Promise<number> {
    try {
        const examResults = await getExamResultsWithSubjects(
            studentId,
            semesterId
        );

        if (examResults.length === 0) {
            return 0;
        }

        return calculateGPAFromResults(examResults);
    } catch (error) {
        console.error("Error calculating semester GPA:", error);
        return 0;
    }
}

/**
 * Helper function to get exam results with subject information
 */
async function getExamResultsWithSubjects(
    studentId: string,
    semesterId?: string
) {
    return await prisma.examResult.findMany({
        where: {
            studentId,
            status: "PASS", // Only consider passed exams
            ...(semesterId && {
                exam: {
                    semesterId,
                },
            }),
        },
        include: {
            grades: {
                include: {
                    subject: {
                        select: {
                            credits: true,
                            code: true,
                            name: true,
                        },
                    },
                },
            },
            exam: {
                select: {
                    maxMarks: true,
                    type: true,
                    semesterId: true,
                },
            },
        },
    });
}

/**
 * Helper function to calculate GPA from exam results
 */
function calculateGPAFromResults(examResults: any[]): number {
    let totalWeightedGradePoints = 0;
    let totalCredits = 0;

    for (const examResult of examResults) {
        // Handle multiple grades per exam result (one per subject)
        if (examResult.grades && Array.isArray(examResult.grades)) {
            for (const grade of examResult.grades) {
                if (grade.subject) {
                    const subject = grade.subject;
                    const marksObtained = grade.marksObtained;
                    const maxMarks = examResult.exam.maxMarks;

                    // Calculate percentage and convert to grade point (10.0 scale)
                    const percentage = (marksObtained / maxMarks) * 100;
                    const gradePoint =
                        convertPercentageToGradePoint(percentage);

                    // Weight by subject credits
                    totalWeightedGradePoints += gradePoint * subject.credits;
                    totalCredits += subject.credits;
                }
            }
        }
    }

    if (totalCredits === 0) {
        return 0;
    }

    // Calculate GPA and round to 2 decimal places
    const gpa = totalWeightedGradePoints / totalCredits;
    return Math.round(gpa * 100) / 100;
}

/**
 * Convert percentage to grade point (10.0 scale)
 * Standard Indian grading scale:
 * 90-100: 10.0 (A+)
 * 80-89:  9.0  (A)
 * 70-79:  8.0  (B+)
 * 60-69:  7.0  (B)
 * 50-59:  6.0  (C)
 * 40-49:  5.0  (D)
 * <40:    0.0  (F)
 */
function convertPercentageToGradePoint(percentage: number): number {
    if (percentage >= 90) return 10.0;
    if (percentage >= 80) return 9.0;
    if (percentage >= 70) return 8.0;
    if (percentage >= 60) return 7.0;
    if (percentage >= 50) return 6.0;
    if (percentage >= 40) return 5.0;
    return 0.0;
}

/**
 * Get detailed academic record for a student
 */
export async function getStudentAcademicRecord(studentId: string) {
    try {
        const cgpa = await calculateStudentCGPA(studentId);

        // Get semester-wise performance
        const semesters = await prisma.semester.findMany({
            where: {
                subjects: {
                    some: {
                        grades: {
                            some: {
                                examResult: {
                                    studentId,
                                },
                            },
                        },
                    },
                },
            },
            select: {
                id: true,
                number: true,
                code: true,
            },
        });

        const semesterPerformance = await Promise.all(
            semesters.map(async (semester) => {
                const gpa = await calculateSemesterGPA(studentId, semester.id);
                return {
                    semester,
                    gpa,
                };
            })
        );

        return {
            cgpa,
            semesterPerformance,
        };
    } catch (error) {
        console.error("Error getting academic record:", error);
        return {
            cgpa: 0,
            semesterPerformance: [],
        };
    }
}
