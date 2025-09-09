export interface User {
    id: string;
    name: string;
    email: string;
    role: "USER" | "STUDENT" | "PROFESSOR" | "ADMIN" | "VERIFIER" | "STAFF";
    userStatus: "VERIFIED" | "NOT_VERIFIED";
    university: {
        id: string;
        name: string;
    };
    universityId?: string;
    course?: {
        id: string;
        name: string;
        code: string;
    };
    courseId?: string;
    hostel?: {
        id: string;
        name: string;
    };
    hostelId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserFilters {
    search?: string;
    role?: "USER" | "STUDENT" | "PROFESSOR" | "ADMIN" | "VERIFIER" | "STAFF";
    userStatus?: "VERIFIED" | "NOT_VERIFIED";
    universityId?: string;
    courseId?: string;
    hostelId?: string;
    sortBy?: "name" | "email" | "role" | "createdAt";
    sortOrder?: "asc" | "desc";
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    role: "USER" | "STUDENT" | "PROFESSOR" | "ADMIN" | "VERIFIER" | "STAFF";
    universityId?: string;
    courseId?: string;
    hostelId?: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    role?: "USER" | "STUDENT" | "PROFESSOR" | "ADMIN" | "VERIFIER" | "STAFF";
    userStatus?: "VERIFIED" | "NOT_VERIFIED";
    universityId?: string;
    courseId?: string;
    hostelId?: string;
}
