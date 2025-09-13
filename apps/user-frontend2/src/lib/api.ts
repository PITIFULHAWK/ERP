// API Configuration and Service Layer
const API_BASE_URL = "http://localhost:5000/api/v1";

// Types for API responses
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: "USER" | "STUDENT" | "PROFESSOR" | "VERIFIER" | "ADMIN";
    userStatus?: "VERIFIED" | "NOT_VERIFIED";
    universityId: string;
    university?: University;
}

export interface University {
    id: string;
    name: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface SignupRequest {
    name: string;
    email: string;
    password: string;
    universityId: string;
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

export interface Payment {
    id: string;
    userId: string;
    type: "COURSE" | "HOSTEL";
    courseId?: string;
    hostelId?: string;
    amount: number;
    currency: string;
    method: "MANUAL" | "RAZORPAY" | "CARD" | "UPI";
    status: "PENDING" | "VERIFIED" | "REJECTED" | "FAILED";
    reference?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    course?: any;
    hostel?: any;
}

export interface Course {
    id: string;
    name: string;
    code: string;
    description?: string;
    duration: number;
    totalFees: number;
    universityId: string;
}

export interface Application {
    id: string;
    userId: string;
    preferredCourseId: string;
    status: "PENDING" | "VERIFIED" | "REJECTED";
    personalInfo: {
        fullName: string;
        dateOfBirth: string;
        gender: string;
        phoneNumber: string;
        address: string;
        emergencyContact: string;
    };
    academicInfo: {
        previousEducation: string;
        marks: number;
        passingYear: number;
        board: string;
    };
    documents: Document[];
    preferredCourse?: Course;
    createdAt: string;
    updatedAt: string;
}

export interface Document {
    id: string;
    applicationId: string;
    type: string;
    fileName: string;
    fileUrl: string;
    isVerified: boolean;
    uploadedAt: string;
}

export interface CreateApplicationRequest {
    preferredCourseId: string;
    personalInfo: {
        fullName: string;
        dateOfBirth: string;
        gender: string;
        phoneNumber: string;
        address: string;
        emergencyContact: string;
    };
    academicInfo: {
        previousEducation: string;
        marks: number;
        passingYear: number;
        board: string;
    };
}

// API Service Class
class ApiService {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        const config: RequestInit = {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            ...options,
        };

        // Add auth token if available
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || `HTTP error! status: ${response.status}`
                );
            }

            return data;
        } catch (error) {
            console.error("API request failed:", error);
            throw error;
        }
    }

    // Authentication endpoints
    async login(
        credentials: LoginRequest
    ): Promise<ApiResponse<LoginResponse>> {
        return this.request<LoginResponse>("/users/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        });
    }

    async signup(userData: SignupRequest): Promise<ApiResponse<User>> {
        return this.request<User>("/users", {
            method: "POST",
            body: JSON.stringify(userData),
        });
    }

    // University endpoints
    async getUniversities(): Promise<ApiResponse<University[]>> {
        return this.request<University[]>("/universities");
    }

    // User endpoints
    async getCurrentUser(): Promise<ApiResponse<User>> {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            throw new Error("No authentication token found");
        }

        // Decode token to get user ID (simple JWT decode)
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return this.request<User>(`/users/${payload.id}`);
        } catch (error) {
            throw new Error("Invalid token format");
        }
    }

    // Notices endpoint
    async getNotices(): Promise<ApiResponse<any[]>> {
        return this.request<any[]>("/notice");
    }

    // Courses endpoint
    async getCourses(): Promise<ApiResponse<any[]>> {
        return this.request<any[]>("/courses");
    }

    // Hostels endpoint
    async getHostels(): Promise<ApiResponse<any[]>> {
        return this.request<any[]>("/hostels");
    }

    // Payment endpoints
    async getPayments(params?: {
        userId?: string;
        type?: "COURSE" | "HOSTEL";
        status?: string;
    }): Promise<ApiResponse<Payment[]>> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });
        }
        const query = queryParams.toString();
        return this.request<Payment[]>(`/payments${query ? `?${query}` : ""}`);
    }

    async createPayment(
        paymentData: CreatePaymentRequest
    ): Promise<ApiResponse<Payment>> {
        return this.request<Payment>("/payments", {
            method: "POST",
            body: JSON.stringify(paymentData),
        });
    }

    async getPaymentSummary(): Promise<ApiResponse<any>> {
        return this.request<any>("/payments/summary");
    }

    // Application endpoints
    async getApplications(params?: {
        userId?: string;
    }): Promise<ApiResponse<Application[]>> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });
        }
        const query = queryParams.toString();
        return this.request<Application[]>(
            `/applications${query ? `?${query}` : ""}`
        );
    }

    async getApplicationById(id: string): Promise<ApiResponse<Application>> {
        return this.request<Application>(`/applications/${id}`);
    }

    async createApplication(
        applicationData: CreateApplicationRequest
    ): Promise<ApiResponse<Application>> {
        return this.request<Application>("/applications", {
            method: "POST",
            body: JSON.stringify(applicationData),
        });
    }

    async uploadDocument(
        applicationId: string,
        file: File,
        documentType: string
    ): Promise<ApiResponse<Document>> {
        const formData = new FormData();
        formData.append("document", file);
        formData.append("applicationId", applicationId);
        formData.append("type", documentType);

        return this.request<Document>("/applications/documents", {
            method: "POST",
            body: formData,
            headers: {
                // Remove Content-Type header to let browser set it with boundary for FormData
            },
        });
    }

    async checkApplicationExists(): Promise<
        ApiResponse<{ exists: boolean; application?: Application }>
    > {
        return this.request<{ exists: boolean; application?: Application }>(
            `/applications/check`
        );
    }
}

// Create and export API service instance
export const apiService = new ApiService(API_BASE_URL);

// Helper functions for token management
export const tokenManager = {
    setToken: (token: string) => {
        localStorage.setItem("auth_token", token);
    },

    getToken: () => {
        return localStorage.getItem("auth_token");
    },

    removeToken: () => {
        localStorage.removeItem("auth_token");
    },

    isTokenValid: () => {
        const token = localStorage.getItem("auth_token");
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp > currentTime;
        } catch {
            return false;
        }
    },
};
