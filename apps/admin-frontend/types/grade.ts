// Grade management types for professors

export interface Grade {
    id: string;
    marksObtained: number;
    examResultId: string;
    subjectId: string;
    createdAt: string;
    updatedAt: string;
    subject: {
        id: string;
        name: string;
        code: string;
        credits: number;
    };
    examResult: {
        id: string;
        totalMarksObtained?: number;
        percentage?: number;
        status: "PASS" | "FAIL" | "PENDING" | "WITHHELD";
        remarks?: string;
        grade?: number;
        student: {
            id: string;
            name: string;
            email: string;
        };
        exam: {
            id: string;
            name: string;
            type: "MID_TERM" | "FINAL_EXAM" | "QUIZ" | "PRACTICAL";
            examDate: string;
            maxMarks: number;
        };
    };
}

export interface CreateGradeRequest {
    professorId: string;
    examResultId: string;
    subjectId: string;
    marksObtained: number;
}

export interface ProfessorAssignment {
    id: string;
    assignmentType: "INSTRUCTOR" | "ASSISTANT";
    isActive: boolean;
    professorId: string;
    sectionId: string;
    subjectId: string;
    canMarkAttendance: boolean;
    canCreateResources: boolean;
    canConductLiveClasses: boolean;
    section: {
        id: string;
        name: string;
        code: string;
        course: {
            id: string;
            name: string;
            code: string;
        };
        semester: {
            id: string;
            code: string;
            number: number;
        };
        academicYear: {
            id: string;
            year: string;
            isActive: boolean;
        };
    };
    subject: {
        id: string;
        name: string;
        code: string;
        credits: number;
    };
}

export interface StudentForGrading {
    student: {
        id: string;
        name: string;
        email: string;
    };
    examResult?: {
        id: string;
        totalMarksObtained?: number;
        percentage?: number;
        status: "PASS" | "FAIL" | "PENDING" | "WITHHELD";
        grades?: Grade;
    };
    currentGrade?: Grade | null;
}

export interface ProfessorExam {
    id: string;
    name: string;
    type: "MID_TERM" | "FINAL_EXAM" | "QUIZ" | "PRACTICAL";
    examDate: string;
    maxMarks: number;
    semester: {
        id: string;
        code: string;
        number: number;
        course: {
            id: string;
            name: string;
            code: string;
        };
    };
    results: Array<{
        id: string;
        totalMarksObtained?: number;
        percentage?: number;
        status: "PASS" | "FAIL" | "PENDING" | "WITHHELD";
        student: {
            id: string;
            name: string;
            email: string;
        };
        grades: Array<{
            id: string;
            marksObtained: number;
            subject: {
                id: string;
                name: string;
                code: string;
            };
        }>;
    }>;
}

export interface GradeFilters {
    sectionId?: string;
    subjectId?: string;
    examId?: string;
}
