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
    fileName: string;
    fileSize: number;
    mimeType: string;
    fileUrl: string;
    url: string; // Keep for backward compatibility
    type:
        | "CLASS_10_MARKSHEET"
        | "CLASS_12_MARKSHEET"
        | "JEE_MAINS_SCORECARD"
        | "PHOTO"
        | "SIGNATURE"
        | "IDENTITY_PROOF"
        | "ADDRESS_PROOF"
        | "CATEGORY_CERTIFICATE"
        | "INCOME_CERTIFICATE"
        | "ACADEMIC_TRANSCRIPTS"
        | "PASSPORT_SIZE_PHOTO"
        | "OTHER";
    isVerified: boolean;
    verifiedBy?: {
        id: string;
        name: string;
        email: string;
    };
    verifiedById?: string;
    verifiedAt?: string;
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
    dateFrom?: string;
    dateTo?: string;
    sortBy?: "appliedAt" | "status" | "applicantName";
    sortOrder?: "asc" | "desc";
}

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

export interface UpdateApplicationRequest {
    status?:
        | "PENDING"
        | "UNDER_REVIEW"
        | "VERIFIED"
        | "REJECTED"
        | "INCOMPLETE";
    verificationNotes?: string;
    rejectionReason?: string;
}

export interface ApplicationStatusUpdate {
    status: "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "INCOMPLETE";
    verificationNotes?: string;
    rejectionReason?: string;
}
