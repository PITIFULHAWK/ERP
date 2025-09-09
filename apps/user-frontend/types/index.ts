// Re-export all types
export * from "./auth";
export * from "./user";
export * from "./academic";
export * from "./application";
export * from "./api";

// Dashboard types
export interface DashboardStats {
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    enrolledCourses: number;
    upcomingExams: number;
    recentNotices: number;
}

export interface DashboardData {
    user: import("./user").UserProfile;
    stats: DashboardStats;
    recentApplications: import("./application").Application[];
    upcomingExams: import("./academic").Exam[];
    recentNotices: import("./academic").Notice[];
    enrolledCourses: import("./academic").Course[];
}

// Notification types
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    read: boolean;
    createdAt: string;
    actionUrl?: string;
}

// Search types
export interface SearchResult {
    universities: import("./academic").University[];
    courses: import("./academic").Course[];
    notices: import("./academic").Notice[];
}

export interface SearchFilters {
    query: string;
    type?: "universities" | "courses" | "notices" | "all";
    universityId?: string;
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
    status: "PENDING" | "SUCCESS" | "FAILED";
    reference?: string;
    gatewayOrderId?: string;
    gatewayPaymentId?: string;
    gatewaySignature?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    receipts: Receipt[];
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