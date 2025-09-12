export interface University {
    id: string;
    name: string;
    location: string;
    type: "PUBLIC" | "PRIVATE";
    uid : string;
    establishedYear: number;
    courses: Array<{
        id: string;
        name: string;
        code: string;
        duration: number;
        totalSemester: number;
    }>;
    hostels: Array<{
        id: string;
        name: string;
        fees: number;
        totalCapacity: number;
        currentTotalStudents: number;
        type: "AC" | "NON_AC";
    }>;
    users: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
    }>;
    notices: Array<{
        id: string;
        title: string;
        content: string;
        publishedAt: string;
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
    createdAt: string;
    updatedAt: string;
}

export interface Course {
    id: string;
    name: string;
    code: string;
    duration: number;
    totalSemester: number;
    totalFees: number;
    currentStudents: number;
    university: {
        id: string;
        name: string;
    };
    universityId: string;
    applications: Array<{
        id: string;
        status: string;
        appliedAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

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

export interface UniversityFilters {
    search?: string;
    type?: "PUBLIC" | "PRIVATE";
    sortBy?: "name" | "establishedYear" | "createdAt";
    sortOrder?: "asc" | "desc";
}

export interface CreateUniversityRequest {
    name: string;
    location: string;
    type: "PUBLIC" | "PRIVATE";
    establishedYear: number;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    uid : string;
}
