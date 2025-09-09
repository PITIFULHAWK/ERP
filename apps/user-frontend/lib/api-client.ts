import {
    ApiResponse,
    LoginRequest,
    RegisterRequest,
    LoginResponse,
    User,
    UserProfile,
    UpdateUserRequest,
    ChangePasswordRequest,
    University,
    Course,
    Hostel,
    Notice,
    Application,
    CreateApplicationRequest,
    UpdateApplicationRequest,
    DocumentUploadRequest,
    ApplicationFilters,
    CourseFilters,
    UniversityFilters,
    HostelFilters,
    NoticeFilters,
    Exam,
    ExamResult,
    Subject,
    Semester,
    DashboardData,
    SearchResult,
    SearchFilters,
} from "../types";

interface RequestConfig extends RequestInit {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public response?: unknown
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export class ApiClient {
    private baseURL: string;
    private defaultTimeout = 30000;
    private defaultRetries = 3;
    private defaultRetryDelay = 1000;

    constructor(baseURL = "http://localhost:5000/api/v1") {
        this.baseURL = baseURL;
    }

    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem("auth_token");
        return {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    private async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private async makeRequest<T>(
        endpoint: string,
        config: RequestConfig = {}
    ): Promise<ApiResponse<T>> {
        const {
            timeout = this.defaultTimeout,
            retries = this.defaultRetries,
            retryDelay = this.defaultRetryDelay,
            ...requestConfig
        } = config;

        const url = `${this.baseURL}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, {
                    ...requestConfig,
                    headers: {
                        ...this.getAuthHeaders(),
                        ...requestConfig.headers,
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new ApiError(
                        errorData.message ||
                            `HTTP ${response.status}: ${response.statusText}`,
                        response.status,
                        errorData
                    );
                }

                const data = await response.json();
                return data;
            } catch (error) {
                lastError = error as Error;

                // Don't retry on client errors (4xx) except 408, 429
                if (error instanceof ApiError && error.status) {
                    if (
                        error.status >= 400 &&
                        error.status < 500 &&
                        error.status !== 408 &&
                        error.status !== 429
                    ) {
                        throw error;
                    }
                }

                // Don't retry on the last attempt
                if (attempt === retries) {
                    break;
                }

                // Wait before retrying
                await this.delay(retryDelay * Math.pow(2, attempt));
            }
        }

        clearTimeout(timeoutId);

        if (lastError instanceof ApiError) {
            throw lastError;
        }

        throw new ApiError(
            lastError?.message || "Network error occurred",
            undefined,
            lastError
        );
    }

    // Generic CRUD methods
    async get<T>(
        endpoint: string,
        config?: RequestConfig
    ): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(endpoint, { ...config, method: "GET" });
    }

    async post<T>(
        endpoint: string,
        data?: unknown,
        config?: RequestConfig
    ): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(endpoint, {
            ...config,
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(
        endpoint: string,
        data?: unknown,
        config?: RequestConfig
    ): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(endpoint, {
            ...config,
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async patch<T>(
        endpoint: string,
        data?: unknown,
        config?: RequestConfig
    ): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(endpoint, {
            ...config,
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(
        endpoint: string,
        config?: RequestConfig
    ): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(endpoint, { ...config, method: "DELETE" });
    }

    // File upload method
    async uploadFile<T>(
        endpoint: string,
        file: File,
        additionalData?: { [key: string]: string },
        config?: Omit<RequestConfig, "headers">
    ): Promise<ApiResponse<T>> {
        const formData = new FormData();
        formData.append("file", file);

        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                formData.append(key, value);
            });
        }

        const token = localStorage.getItem("auth_token");
        return this.makeRequest<T>(endpoint, {
            ...config,
            method: "POST",
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
        });
    }

    // AUTH METHODS
    async login(
        credentials: LoginRequest
    ): Promise<ApiResponse<LoginResponse>> {
        return this.post<LoginResponse>("/users/login", credentials);
    }

    async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
        return this.post<User>("/users", userData);
    }

    // USER METHODS
    async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
        const token = localStorage.getItem("auth_token");
        if (!token) throw new ApiError("No token found");

        // Decode token to get user ID (simple JWT decode)
        const payload = JSON.parse(atob(token.split(".")[1]));
        return this.get<UserProfile>(`/users/${payload.id}`);
    }

    async updateProfile(
        userId: string,
        data: UpdateUserRequest
    ): Promise<ApiResponse<User>> {
        return this.patch<User>(`/users/${userId}`, data);
    }

    async changePassword(
        data: ChangePasswordRequest
    ): Promise<ApiResponse<{ message: string }>> {
        return this.post<{ message: string }>("/users/change-password", data);
    }

    // UNIVERSITY METHODS (Public)
    async getUniversities(
        filters?: UniversityFilters
    ): Promise<ApiResponse<University[]>> {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, String(value));
            });
        }
        return this.get<University[]>(`/universities?${params.toString()}`);
    }

    async getUniversityById(id: string): Promise<ApiResponse<University>> {
        return this.get<University>(`/universities/${id}`);
    }

    // COURSE METHODS (Public)
    async getCourses(filters?: CourseFilters): Promise<ApiResponse<Course[]>> {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, String(value));
            });
        }
        return this.get<Course[]>(`/courses?${params.toString()}`);
    }

    async getCourseById(id: string): Promise<ApiResponse<Course>> {
        return this.get<Course>(`/courses/${id}`);
    }

    // HOSTEL METHODS (Public)
    async getHostels(filters?: HostelFilters): Promise<ApiResponse<Hostel[]>> {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, String(value));
            });
        }
        return this.get<Hostel[]>(`/hostels?${params.toString()}`);
    }

    async getHostelById(id: string): Promise<ApiResponse<Hostel>> {
        return this.get<Hostel>(`/hostels/${id}`);
    }

    // NOTICE METHODS (Public)
    async getNotices(filters?: NoticeFilters): Promise<ApiResponse<Notice[]>> {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, String(value));
            });
        }
        return this.get<Notice[]>(`/notice?${params.toString()}`);
    }

    async getNoticeById(id: string): Promise<ApiResponse<Notice>> {
        return this.get<Notice>(`/notice/${id}`);
    }

    // APPLICATION METHODS
    async getMyApplications(
        filters?: ApplicationFilters
    ): Promise<ApiResponse<Application[]>> {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, String(value));
            });
        }
        return this.get<Application[]>(`/applications?${params.toString()}`);
    }

    async getApplicationById(id: string): Promise<ApiResponse<Application>> {
        return this.get<Application>(`/applications/${id}`);
    }

    async createApplication(
        data: CreateApplicationRequest
    ): Promise<ApiResponse<Application>> {
        return this.post<Application>("/applications", data);
    }

    async updateApplication(
        id: string,
        data: UpdateApplicationRequest
    ): Promise<ApiResponse<Application>> {
        return this.put<Application>(`/applications/${id}`, data);
    }

    async cancelApplication(id: string): Promise<ApiResponse<Application>> {
        return this.patch<Application>(`/applications/${id}`, {
            status: "CANCELLED",
        });
    }

    async deleteApplication(
        id: string
    ): Promise<ApiResponse<{ message: string }>> {
        return this.delete<{ message: string }>(`/applications/${id}`);
    }

    // DOCUMENT METHODS
    async uploadDocument(
        data: DocumentUploadRequest
    ): Promise<ApiResponse<{ document: { id: string; url: string } }>> {
        return this.uploadFile("/applications/documents", data.file, {
            name: data.name,
            type: data.type,
            applicationId: data.applicationId,
        });
    }

    // ACADEMIC METHODS (Student only)
    async getMySemesters(): Promise<ApiResponse<Semester[]>> {
        return this.get<Semester[]>("/semesters/my");
    }

    async getMySubjects(): Promise<ApiResponse<Subject[]>> {
        return this.get<Subject[]>("/subjects/my");
    }

    async getMyExams(): Promise<ApiResponse<Exam[]>> {
        return this.get<Exam[]>("/exams/my");
    }

    async getMyExamResults(): Promise<ApiResponse<ExamResult[]>> {
        return this.get<ExamResult[]>("/exams/results/my");
    }

    async getSubjectsBySemester(
        semesterId: string
    ): Promise<ApiResponse<Subject[]>> {
        return this.get<Subject[]>(`/subjects/semester/${semesterId}`);
    }

    // DASHBOARD METHOD
    async getDashboardData(): Promise<ApiResponse<DashboardData>> {
        return this.get<DashboardData>("/dashboard");
    }

    // SEARCH METHOD
    async search(filters: SearchFilters): Promise<ApiResponse<SearchResult>> {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) params.append(key, String(value));
        });
        return this.get<SearchResult>(`/search?${params.toString()}`);
    }

    // Health check
    async healthCheck(): Promise<boolean> {
        try {
            await this.get("/health", { timeout: 5000, retries: 1 });
            return true;
        } catch {
            return false;
        }
    }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types
export type { ApiResponse, RequestConfig, ApiError };
