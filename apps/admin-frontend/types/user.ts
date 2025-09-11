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
    coursesOpted?: Array<{
        id: string;
        name: string;
        description: string;
        duration: number;
    }>;
    hostelOpted?: {
        id: string;
        name: string;
        address: string;
        feePerMonth: number;
        capacity: number;
    };
    application?: {
        id: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        gender: "MALE" | "FEMALE" | "OTHER";
        nationality: string;
        phoneNumber: string;
        alternatePhoneNumber?: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
        class10Percentage: number;
        class10Board: string;
        class10YearOfPassing: number;
        class12Percentage: number;
        class12Board: string;
        class12YearOfPassing: number;
        class12Stream: string;
        hasJeeMainsScore: boolean;
        jeeMainsScore?: number;
        jeeMainsRank?: number;
        jeeMainsYear?: number;
        preferredCourse: {
            id: string;
            name: string;
            code: string;
            credits: number;
            totalSemester: number;
            totalFees: number;
            university: {
                id: string;
                name: string;
                location: string;
                type: "PUBLIC" | "PRIVATE";
            };
        };
        status:
            | "PENDING"
            | "UNDER_REVIEW"
            | "VERIFIED"
            | "REJECTED"
            | "INCOMPLETE";
        verifiedBy?: {
            id: string;
            name: string;
            email: string;
        };
        verifiedAt?: string;
        verificationNotes?: string;
        rejectionReason?: string;
        documents: Array<{
            id: string;
            name: string;
            type: string;
            url: string;
            isVerified?: boolean;
            verifiedBy?: {
                id: string;
                name: string;
                email: string;
            };
            verifiedAt?: string;
            createdAt: string;
            updatedAt: string;
        }>;
        createdAt: string;
        updatedAt: string;
    };
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
