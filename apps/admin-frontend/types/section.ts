export interface Section {
    id: string;
    name: string;
    code: string;
    maxCapacity: number;
    currentCapacity: number;
    isActive: boolean;
    course: {
        id: string;
        name: string;
    };
    enrollments: Enrollment[];
    createdAt: string;
    updatedAt: string;
}

export interface Enrollment {
    id: string;
    enrollmentDate: string;
    isActive: boolean;
    currentSemester: number;
    student: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    section: {
        id: string;
        name: string;
        code: string;
    };
    course: {
        id: string;
        name: string;
    };
}

export interface CreateSectionRequest {
    name: string;
    code: string;
    maxCapacity: number;
    courseId: string;
}

export interface UpdateSectionRequest {
    name?: string;
    code?: string;
    maxCapacity?: number;
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
