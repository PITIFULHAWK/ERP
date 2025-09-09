// Application types for user-frontend
export interface Application {
    id: string;
    status:
        | "PENDING"
        | "UNDER_REVIEW"
        | "APPROVED"
        | "REJECTED"
        | "VERIFIED"
        | "CANCELLED";
    appliedAt: string;
    reviewedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
    verifiedAt?: string;
    cancelledAt?: string;
    remarks?: string;
    applicant: {
        id: string;
        name: string;
        email: string;
    };
    applicantId: string;
    course: {
        id: string;
        name: string;
        code: string;
        duration: number;
        totalSemester: number;
        totalFees: number;
        university: {
            id: string;
            name: string;
            location: string;
            type: "PUBLIC" | "PRIVATE";
        };
    };
    courseId: string;
    university: {
        id: string;
        name: string;
        location: string;
        type: "PUBLIC" | "PRIVATE";
    };
    universityId: string;
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
    courseId: string;
    documents?: {
        name: string;
        type:
            | "IDENTITY_PROOF"
            | "ADDRESS_PROOF"
            | "ACADEMIC_TRANSCRIPTS"
            | "PASSPORT_SIZE_PHOTO"
            | "OTHER";
        url: string;
    }[];
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
