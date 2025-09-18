// Generic API Response interface
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

// Additional API types that are missing from the main type files

// Login types
export interface LoginCredentials {
    email: string;
    password: string;
}

// University update and onboard types
export interface UpdateUniversityRequest {
    name?: string;
    location?: string;
    type?: "PUBLIC" | "PRIVATE";
    establishedYear?: number;
}

export interface OnboardUniversityRequest {
    universityId: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
}

// Course update types
export interface UpdateCourseRequest {
    name?: string;
    code?: string;
    duration?: number;
    totalSemester?: number;
    totalFees?: number;
    maxStudents?: number;
    description?: string;
}

// Hostel types
export interface CreateHostelRequest {
    name: string;
    fees: number;
    totalCapacity: number;
    type: "AC" | "NON_AC";
    universityId: string;
}

export interface UpdateHostelRequest {
    name?: string;
    fees?: number;
    totalCapacity?: number;
    type?: "AC" | "NON_AC";
}

export interface HostelFilters {
    search?: string;
    type?: "AC" | "NON_AC";
    universityId?: string;
    sortBy?: "name" | "fees" | "totalCapacity" | "createdAt";
    sortOrder?: "asc" | "desc";
}

// Application verification types
export interface VerifyApplicationRequest {
    status:
        | "PENDING"
        | "UNDER_REVIEW"
        | "APPROVED"
        | "REJECTED"
        | "VERIFIED"
        | "CANCELLED"
        | "INCOMPLETE";
    remarks?: string;
    verifierId?: string;
}

// Document types
export interface CreateDocumentRequest {
    name: string;
    type:
        | "IDENTITY_PROOF"
        | "ADDRESS_PROOF"
        | "ACADEMIC_TRANSCRIPTS"
        | "PASSPORT_SIZE_PHOTO"
        | "OTHER";
    url: string;
    applicationId: string;
}

// Semester types
export interface CreateSemesterRequest {
    code: string;
    number: number;
    courseId: string;
}

export interface UpdateSemesterRequest {
    code?: string;
    number?: number;
}

export interface SemesterFilters {
    search?: string;
    courseId?: string;
    number?: number;
    sortBy?: "code" | "number" | "createdAt";
    sortOrder?: "asc" | "desc";
}

// Subject types
export interface CreateSubjectRequest {
    name: string;
    code: string;
    credits: number;
    semesterId: string;
}

export interface UpdateSubjectRequest {
    name?: string;
    code?: string;
    credits?: number;
}

export interface SubjectFilters {
    search?: string;
    semesterId?: string;
    credits?: number;
    sortBy?: "name" | "code" | "credits" | "createdAt";
    sortOrder?: "asc" | "desc";
}

// Grade types
export interface CreateGradeRequest {
    marksObtained: number;
    examResultId: string;
    subjectId: string;
}

// Exam types
export interface CreateExamRequest {
    name: string;
    type: "FINAL_EXAM";
    examDate: string;
    maxMarks: number;
    semesterId: string;
}

export interface UpdateExamRequest {
    name?: string;
    type?: "MID_TERM" | "FINAL_EXAM" | "QUIZ" | "PRACTICAL";
    examDate?: string;
    maxMarks?: number;
}

export interface ExamFilters {
    search?: string;
    type?: "MID_TERM" | "FINAL_EXAM" | "QUIZ" | "PRACTICAL";
    semesterId?: string;
    examDateAfter?: string;
    examDateBefore?: string;
    sortBy?: "name" | "examDate" | "maxMarks" | "createdAt";
    sortOrder?: "asc" | "desc";
}

// Exam Result types
export interface CreateExamResultRequest {
    totalMarksObtained?: number;
    percentage?: number;
    status: "PASS" | "FAIL" | "PENDING" | "WITHHELD";
    remarks?: string;
    grade?: number;
    studentId: string;
    examId: string;
}

export interface UpdateExamResultRequest {
    totalMarksObtained?: number;
    percentage?: number;
    status?: "PASS" | "FAIL" | "PENDING" | "WITHHELD";
    remarks?: string;
    grade?: number;
}

export interface ExamResultFilters {
    status?: "PASS" | "FAIL" | "PENDING" | "WITHHELD";
    examId?: string;
    studentId?: string;
    sortBy?: "totalMarksObtained" | "percentage" | "createdAt";
    sortOrder?: "asc" | "desc";
}

// Notice types
export interface CreateNoticeRequest {
    title: string;
    content: string;
    universityId: string;
    type?: "GENERAL" | "URGENT" | "ACADEMIC" | "HOSTEL" | "EXAM";
    priority?: "LOW" | "MEDIUM" | "HIGH";
    targetAudience?: "ALL" | "STUDENTS" | "FACULTY" | "STAFF";
    publishedAt?: string;
}

export interface UpdateNoticeRequest {
    title?: string;
    content?: string;
    publishedAt?: string;
    type?: "GENERAL" | "URGENT" | "ACADEMIC" | "HOSTEL" | "EXAM";
    priority?: "LOW" | "MEDIUM" | "HIGH";
    targetAudience?: "ALL" | "STUDENTS" | "FACULTY" | "STAFF";
}

export interface NoticeFilters {
    search?: string;
    universityId?: string;
    publishedAfter?: string;
    publishedBefore?: string;
    sortBy?: "title" | "publishedAt" | "createdAt";
    sortOrder?: "asc" | "desc";
}
