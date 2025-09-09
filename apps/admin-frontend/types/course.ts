export interface Course {
    id: string;
    name: string;
    code: string;
    duration: number;
    totalSemester: number;
    totalFees: number;
    currentStudents: number;
    maxStudents?: number;
    description?: string;
    university: {
        id: string;
        name: string;
    };
    universityId: string;
    users: Array<{
        id: string;
        name: string;
        email: string;
    }>;
    applications: Array<{
        id: string;
        status: string;
        appliedAt: string;
        applicant: {
            id: string;
            name: string;
            email: string;
        };
    }>;
    semesters: Semester[];
    createdAt: string;
    updatedAt: string;
}

export interface Semester {
    id: string;
    code: string;
    number: number;
    course: {
        id: string;
        name: string;
        code: string;
        totalSemester: number;
    };
    courseId: string;
    subjects: Subject[];
    exams: Exam[];
    createdAt: string;
    updatedAt: string;
}

export interface Subject {
    id: string;
    name: string;
    code: string;
    credits: number;
    semester: {
        id: string;
        code: string;
        number: number;
    };
    semesterId: string;
    grades: Grade[];
    createdAt: string;
    updatedAt: string;
}

export interface Exam {
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
        };
    };
    semesterId: string;
    results: ExamResult[];
    createdAt: string;
    updatedAt: string;
}

export interface ExamResult {
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
    studentId: string;
    exam: Exam;
    examId: string;
    grades: Grade[];
    createdAt: string;
    updatedAt: string;
}

export interface Grade {
    id: string;
    marksObtained: number;
    examResult: {
        id: string;
        student: {
            id: string;
            name: string;
        };
        exam: {
            id: string;
            name: string;
        };
    };
    examResultId: string;
    subject: Subject;
    subjectId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CourseFilters {
    search?: string;
    universityId?: string;
    sortBy?: "name" | "code" | "createdAt" | "currentStudents";
    sortOrder?: "asc" | "desc";
}

export interface CreateCourseRequest {
    name: string;
    code: string;
    duration: number;
    totalSemester: number;
    totalFees: number;
    maxStudents?: number;
    description?: string;
    universityId: string;
}
