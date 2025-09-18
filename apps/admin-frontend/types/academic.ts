// Hostel related types
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

// Semester related types
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

// Subject related types
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

// Exam related types
export interface Exam {
    id: string;
    name: string;
    type: "FINAL_EXAM";
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

// Notice related types
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
    createdAt: string;
    updatedAt: string;
}
