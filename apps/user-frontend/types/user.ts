// User types for the user-frontend
import type { Application } from "./application";
import type { Course, Hostel } from "./academic";

export interface User {
    id: string;
    name: string;
    email: string;
    role: "USER" | "STUDENT" | "PROFESSOR" | "ADMIN" | "VERIFIER" | "STAFF";
    userStatus: "VERIFIED" | "NOT_VERIFIED";
    university?: {
        id: string;
        name: string;
        location: string;
        type: "PUBLIC" | "PRIVATE";
        establishedYear: number;
    };
    universityId?: string;
    course?: {
        id: string;
        name: string;
        code: string;
        duration: number;
        totalSemester: number;
        totalFees: number;
    };
    courseId?: string;
    hostel?: {
        id: string;
        name: string;
        fees: number;
        type: "AC" | "NON_AC";
    };
    hostelId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile extends User {
    applications?: Application[];
    coursesOpted?: Course[];
    hostelOpted?: Hostel;
}

// Update user profile request
export interface UpdateUserRequest {
    name?: string;
    email?: string;
}

// Password change request
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
