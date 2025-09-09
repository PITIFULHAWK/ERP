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
        university: {
            id: string;
            name: string;
        };
    };
    courseId: string;
    university: {
        id: string;
        name: string;
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

export interface ApplicationFilters {
    status?:
        | "PENDING"
        | "UNDER_REVIEW"
        | "APPROVED"
        | "REJECTED"
        | "VERIFIED"
        | "CANCELLED";
    universityId?: string;
    courseId?: string;
    applicantId?: string;
    search?: string;
    appliedAfter?: string;
    appliedBefore?: string;
    sortBy?: "appliedAt" | "status" | "applicantName";
    sortOrder?: "asc" | "desc";
}

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

export interface UpdateApplicationRequest {
    status?:
        | "PENDING"
        | "UNDER_REVIEW"
        | "APPROVED"
        | "REJECTED"
        | "VERIFIED"
        | "CANCELLED";
    remarks?: string;
}

export interface ApplicationStatusUpdate {
    status:
        | "PENDING"
        | "UNDER_REVIEW"
        | "APPROVED"
        | "REJECTED"
        | "VERIFIED"
        | "CANCELLED";
    remarks?: string;
}
