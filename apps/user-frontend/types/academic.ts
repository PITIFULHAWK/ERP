// University types
import type { Application } from "./application";

export interface University {
    id: string;
    name: string;
    location: string;
    type: "PUBLIC" | "PRIVATE";
    establishedYear: number;
    courses: Course[];
    hostels: Hostel[];
    notices: Notice[];
    createdAt: string;
    updatedAt: string;
}

// Course types
export interface Course {
    id: string;
    name: string;
    code: string;
    credits: number;
    totalSemester: number;
    totalFees: number;
    currentStudents: number;
    university: {
        id: string;
        name: string;
        location: string;
        type: "PUBLIC" | "PRIVATE";
    };
    universityId: string;
    semesters: Semester[];
    applications: Application[];
    createdAt: string;
    updatedAt: string;
}

// Semester types
export interface Semester {
    id: string;
    code: string;
    number: number;
    fees: number;
    course: {
        id: string;
        name: string;
        code: string;
    };
    courseId: string;
    subjects: Subject[];
    exams: Exam[];
    createdAt: string;
    updatedAt: string;
}

// Subject types
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

// Exam types
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

// Exam Result types
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

// Grade types
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

// Hostel types
export interface Hostel {
    id: string;
    name: string;
    fees: number;
    totalCapacity: number;
    currentTotalStudents: number;
    type: "AC" | "NON_AC";
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
    createdAt: string;
    updatedAt: string;
}

// Notice types
export interface Notice {
    id: string;
    title: string;
    content: string;
    publishedAt: string;
    university: {
        id: string;
        name: string;
    };
    universityId: string;
    category?: string;
    priority?: "high" | "medium" | "low";
    isActive?: boolean;
    attachments?: string[];
    createdAt: string;
    updatedAt: string;
}
