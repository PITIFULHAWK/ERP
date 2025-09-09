// Application types for user-frontend
export interface Application {
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
    preferredCourseId: string;
    status: "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "INCOMPLETE";
    verifiedBy?: {
        id: string;
        name: string;
        email: string;
    };
    verifiedById?: string;
    verifiedAt?: string;
    verificationNotes?: string;
    rejectionReason?: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    userId: string;
    documents: ApplicationDocument[];
    createdAt: string;
    updatedAt: string;
}

export interface ApplicationDocument {
    id: string;
    name: string;
    type:
        | "IDENTITY_PROOF"
        | "ADDRESS_PROOF"
        | "ACADEMIC_TRANSCRIPTS"
        | "PASSPORT_SIZE_PHOTO"
        | "OTHER";
    url: string;
    application: Application;
    applicationId: string;
    createdAt: string;
    updatedAt: string;
}

// For creating new applications
export interface CreateApplicationRequest {
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
    hasJeeMainsScore?: boolean;
    jeeMainsScore?: number;
    jeeMainsRank?: number;
    jeeMainsYear?: number;
    preferredCourseId: string;
    userId: string;
}

// For updating application status (user can only cancel)
export interface UpdateApplicationRequest {
    status?: "CANCELLED";
    remarks?: string;
}

// Document upload
export interface DocumentUploadRequest {
    name: string;
    type:
        | "IDENTITY_PROOF"
        | "ADDRESS_PROOF"
        | "ACADEMIC_TRANSCRIPTS"
        | "PASSPORT_SIZE_PHOTO"
        | "OTHER";
    file: File;
    applicationId: string;
}

// Application filters for user
export interface ApplicationFilters {
    status?:
        | "PENDING"
        | "UNDER_REVIEW"
        | "APPROVED"
        | "REJECTED"
        | "VERIFIED"
        | "CANCELLED";
    courseId?: string;
    universityId?: string;
    appliedAfter?: string;
    appliedBefore?: string;
    sortBy?: "appliedAt" | "status";
    sortOrder?: "asc" | "desc";
}

// Application statistics for user dashboard
export interface ApplicationStats {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    verified: number;
    cancelled: number;
}
