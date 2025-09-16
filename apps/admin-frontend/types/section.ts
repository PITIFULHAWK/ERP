export interface Section {
    id: string;
    name: string;
    code: string;
    description?: string;
    maxStudents: number;
    currentStudents: number;
    isActive: boolean;
    course: {
        id: string;
        name: string;
        code?: string;
    };
    semester?: {
        id: string;
        code: string;
        number: number;
    };
    academicYear?: {
        id: string;
        year: string;
        isActive: boolean;
    };
    enrollments: Enrollment[];
    professorAssignments?: {
        id: string;
        assignmentType: string;
        isActive: boolean;
        professor: {
            id: string;
            name: string;
            email: string;
        };
        subject: {
            id: string;
            name: string;
            code: string;
        };
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface Enrollment {
    id: string;
    enrollmentDate: string;
    isActive: boolean;
    currentSemester: number;
    status: string;
    createdAt: string;
    student: {
        id: string;
        name: string;
        email: string;
    };
    section: {
        id: string;
        name: string;
        code: string;
    };
    enrollment: {
        id: string;
        course: {
            id: string;
            name: string;
        };
        semester: {
            id: string;
            code: string;
            number: number;
        };
    };
}

export interface CreateSectionRequest {
    name: string;
    code: string;
    description?: string;
    maxStudents: number;
    courseId: string;
    semesterId: string;
    academicYearId: string;
    startTime?: string;
    endTime?: string;
}

export interface UpdateSectionRequest {
    name?: string;
    code?: string;
    maxStudents?: number;
    isActive?: boolean;
}

export interface SectionFilters {
    courseId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}

export interface CreateEnrollmentRequest {
    studentId: string;
    sectionId: string;
    courseId: string;
    currentSemester: number;
    semesterId?: string;
    academicYearId?: string;
}

export interface UpdateEnrollmentRequest {
    currentSemester?: number;
    isActive?: boolean;
}

export interface EnrollmentFilters {
    sectionId?: string;
    courseId?: string;
    studentId?: string;
    isActive?: boolean;
    semester?: number;
    page?: number;
    limit?: number;
}
