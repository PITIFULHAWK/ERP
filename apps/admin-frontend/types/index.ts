// Re-export all API types first
export * from "./api";

// Re-export specific types to avoid conflicts
export type {
    User,
    UserFilters,
    CreateUserRequest,
    UpdateUserRequest,
} from "./user";
export type {
    University,
    UniversityFilters,
    CreateUniversityRequest,
} from "./university";
export type {
    Course,
    Semester,
    Subject,
    Exam,
    ExamResult,
    Grade,
    CreateCourseRequest,
} from "./course";
export type {
    Application,
    ApplicationDocument,
    ApplicationFilters,
    CreateApplicationRequest,
    UpdateApplicationRequest,
    ApplicationStatusUpdate,
} from "./application";
export type {
    Placement,
    CreatePlacementRequest,
    UpdatePlacementRequest,
    PlacementStats,
    EligibleUsersInfo,
    NotificationResult,
} from "./placement";

// Re-export university specific types with prefixes to avoid conflicts
export type {
    Course as UniversityCourse,
    Hostel as UniversityHostel,
    Notice as UniversityNotice,
} from "./university";

// Auth related types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        universityId?: string;
    };
    token: string;
}

export interface AuthContextType {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        universityId?: string;
    } | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// Common types
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ApiError {
    success: false;
    message: string;
    error?: string;
}

// Payment types
export interface Payment {
    id: string;
    userId: string;
    type: "COURSE" | "HOSTEL";
    courseId?: string;
    hostelId?: string;
    amount: number;
    currency: string;
    method: "MANUAL" | "RAZORPAY" | "CARD" | "UPI";
    status: "PENDING" | "SUCCESS" | "FAILED" | "VERIFIED" | "REJECTED";
    reference?: string;
    gatewayOrderId?: string;
    gatewayPaymentId?: string;
    gatewaySignature?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    receipts: Receipt[];
    user: {
        id: string;
        name: string;
        email: string;
    };
    course?: {
        id: string;
        name: string;
        code: string;
    };
    hostel?: {
        id: string;
        name: string;
        type: string;
    };
}

export interface Receipt {
    id: string;
    paymentId: string;
    mediaUrl: string;
    mediaType: string;
    uploadedById: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    uploadedBy: {
        id: string;
        name: string;
        email: string;
    };
}

export interface CreatePaymentRequest {
    userId: string;
    type: "COURSE" | "HOSTEL";
    courseId?: string;
    hostelId?: string;
    amount: number;
    currency?: string;
    method?: "MANUAL" | "RAZORPAY" | "CARD" | "UPI";
    reference?: string;
    notes?: string;
}

export interface CreateReceiptRequest {
    paymentId: string;
    uploadedById: string;
    mediaUrl: string;
    mediaType: string;
    notes?: string;
}

export interface VerifyPaymentRequest {
    status: "VERIFIED" | "REJECTED";
    verificationNotes?: string;
    rejectionReason?: string;
}

export interface PaymentSummary {
    course: {
        total: number;
        paid: number;
        due: number;
    };
    hostel: {
        total: number;
        paid: number;
        due: number;
    };
}

export interface PaymentFilters {
    userId?: string;
    type?: "COURSE" | "HOSTEL";
    status?: "PENDING" | "SUCCESS" | "FAILED" | "VERIFIED" | "REJECTED";
    method?: "MANUAL" | "RAZORPAY" | "CARD" | "UPI";
    courseId?: string;
    hostelId?: string;
    search?: string;
    createdAfter?: string;
    createdBefore?: string;
    sortBy?: "createdAt" | "amount" | "status";
    sortOrder?: "asc" | "desc";
}
