import {
    UserFilters,
    CreateUserRequest,
    UpdateUserRequest,
    CreateUniversityRequest,
    UpdateUniversityRequest,
    OnboardUniversityRequest,
    CreateCourseRequest,
    ApplicationFilters,
    CreateApplicationRequest,
    VerifyApplicationRequest,

    // Additional API types
    LoginCredentials,
    CreateHostelRequest,
    UpdateHostelRequest,
    HostelFilters,
    CreateDocumentRequest,
    CreateSemesterRequest,
    UpdateSemesterRequest,
    SemesterFilters,
    CreateSubjectRequest,
    UpdateSubjectRequest,
    SubjectFilters,
    CreateGradeRequest,
    CreateExamRequest,
    UpdateExamRequest,
    ExamFilters,
    CreateExamResultRequest,
    CreateNoticeRequest,
    UpdateNoticeRequest,
    NoticeFilters,
    CreatePaymentRequest,
    CreateReceiptRequest,
    VerifyPaymentRequest,
    PaymentFilters,
} from "../types";
import { config } from "./config";

const API_BASE_URL = config.apiUrl;

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private getAuthToken(): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("auth_token");
    }

    private getAuthHeaders(): HeadersInit {
        const token = this.getAuthToken();
        return {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        const config: RequestInit = {
            headers: this.getAuthHeaders(),
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage =
                        errorData.message || errorData.error || errorMessage;
                } catch {
                    // If we can't parse the error response, use the default message
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("API request failed:", error);
            if (error instanceof TypeError && error.message.includes("fetch")) {
                throw new Error(
                    "Unable to connect to the server. Please make sure the backend server is running."
                );
            }
            throw error;
        }
    }

    // ====== AUTH ENDPOINTS ======
    async login(credentials: LoginCredentials) {
        return this.request("/users/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        });
    }

    async logout() {
        return this.request("/auth/logout", {
            method: "POST",
        });
    }

    async getCurrentUser() {
        // Since we don't have /auth/me endpoint, we'll need to get user ID from token
        // For now, let's return null and handle this in the auth context
        return null;
    }

    async refreshToken() {
        return this.request("/auth/refresh", {
            method: "POST",
        });
    }

    // ====== USER MANAGEMENT ======
    async getUsers(filters?: UserFilters) {
        const params = filters
            ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
            : "";
        return this.request(`/users${params}`);
    }

    async getUser(id: string) {
        return this.request(`/users/${id}`);
    }

    async createUser(userData: CreateUserRequest) {
        return this.request("/users", {
            method: "POST",
            body: JSON.stringify(userData),
        });
    }

    async updateUser(id: string, userData: UpdateUserRequest) {
        return this.request(`/users/${id}`, {
            method: "PATCH",
            body: JSON.stringify(userData),
        });
    }

    async deleteUser(id: string) {
        return this.request(`/users/${id}`, {
            method: "DELETE",
        });
    }

    async updateUserRole(
        id: string,
        role: "STUDENT" | "PROFESSOR" | "VERIFIER" | "ADMIN"
    ) {
        return this.request(`/users/${id}/role`, {
            method: "PATCH",
            body: JSON.stringify({ role }),
        });
    }

    // ====== UNIVERSITY MANAGEMENT ======
    async getUniversities() {
        return this.request("/universities");
    }

    async getUniversity(id: string) {
        return this.request(`/universities/${id}`);
    }

    async createUniversity(universityData: CreateUniversityRequest) {
        return this.request("/universities", {
            method: "POST",
            body: JSON.stringify(universityData),
        });
    }

    async updateUniversity(
        id: string,
        universityData: UpdateUniversityRequest
    ) {
        return this.request(`/universities/${id}`, {
            method: "PATCH",
            body: JSON.stringify(universityData),
        });
    }

    async deleteUniversity(id: string) {
        return this.request(`/universities/${id}`, {
            method: "DELETE",
        });
    }

    async onboardUniversity(data: OnboardUniversityRequest) {
        return this.request("/universities/onboard", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    // ====== COURSE MANAGEMENT ======
    async getCourses() {
        return this.request(`/courses`);
    }

    async getCourse(id: string) {
        return this.request(`/courses/${id}`);
    }

    async createCourse(courseData: CreateCourseRequest) {
        return this.request("/courses", {
            method: "POST",
            body: JSON.stringify(courseData),
        });
    }

    async enrollStudentInCourse(courseId: string, userId: string) {
        return this.request(`/courses/${courseId}/enroll-student/${userId}`, {
            method: "PATCH",
        });
    }

    // ====== HOSTEL MANAGEMENT ======
    async getHostels(filters?: HostelFilters) {
        const params = filters
            ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
            : "";
        return this.request(`/hostels${params}`);
    }

    async getHostel(id: string) {
        return this.request(`/hostels/${id}`);
    }

    async createHostel(hostelData: CreateHostelRequest) {
        return this.request("/hostels", {
            method: "POST",
            body: JSON.stringify(hostelData),
        });
    }

    async updateHostel(id: string, hostelData: UpdateHostelRequest) {
        return this.request(`/hostels/${id}`, {
            method: "PATCH",
            body: JSON.stringify(hostelData),
        });
    }

    async deleteHostel(id: string) {
        return this.request(`/hostels/${id}`, {
            method: "DELETE",
        });
    }

    async addStudentToHostel(hostelId: string, userId: string) {
        return this.request(`/hostels/${hostelId}/add-student/${userId}`, {
            method: "PATCH",
        });
    }

    // ====== APPLICATION MANAGEMENT ======
    async getApplications(filters?: ApplicationFilters) {
        const params = filters
            ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
            : "";
        return this.request(`/applications${params}`);
    }

    async getApplication(id: string) {
        return this.request(`/applications/${id}`);
    }

    async createApplication(applicationData: CreateApplicationRequest) {
        return this.request("/applications", {
            method: "POST",
            body: JSON.stringify(applicationData),
        });
    }

    async updateApplication(
        id: string,
        applicationData: Partial<CreateApplicationRequest>
    ) {
        return this.request(`/applications/${id}`, {
            method: "PATCH",
            body: JSON.stringify(applicationData),
        });
    }

    async verifyApplication(
        id: string,
        verificationData: VerifyApplicationRequest
    ) {
        const headers: HeadersInit = {
            ...this.getAuthHeaders(),
        };

        // Add verifier ID to headers if provided
        if (verificationData.verifierId) {
            (headers as Record<string, string>)["x-verifier-id"] =
                verificationData.verifierId;
            console.log(
                `Setting verifier ID in header: ${verificationData.verifierId}`
            );
        }

        return this.request(`/applications/${id}/verify`, {
            method: "PATCH",
            body: JSON.stringify(verificationData),
            headers,
        });
    }

    async deleteApplication(id: string) {
        return this.request(`/applications/${id}`, {
            method: "DELETE",
        });
    }

    // Document management
    async addDocument(documentData: CreateDocumentRequest) {
        return this.request("/applications/documents", {
            method: "POST",
            body: JSON.stringify(documentData),
        });
    }

    async verifyDocument(id: string, verifierId?: string) {
        const headers: HeadersInit = {
            ...this.getAuthHeaders(),
        };

        // Add verifier ID to headers if provided
        if (verifierId) {
            (headers as Record<string, string>)["x-verifier-id"] = verifierId;
            console.log(
                `Setting document verifier ID in header: ${verifierId}`
            );
        }

        return this.request(`/applications/documents/${id}/verify`, {
            method: "PATCH",
            headers,
        });
    }

    // ====== SEMESTER MANAGEMENT ======
    async getSemesters(filters?: SemesterFilters) {
        const params = filters
            ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
            : "";
        return this.request(`/semesters${params}`);
    }

    async getSemestersByCourse(courseId: string) {
        return this.request(`/semesters/${courseId}`);
    }

    async createSemester(semesterData: CreateSemesterRequest) {
        return this.request("/semesters", {
            method: "POST",
            body: JSON.stringify(semesterData),
        });
    }

    async updateSemester(
        semesterId: string,
        semesterData: UpdateSemesterRequest
    ) {
        return this.request(`/semesters/${semesterId}`, {
            method: "PATCH",
            body: JSON.stringify(semesterData),
        });
    }

    async deleteSemester(semesterId: string) {
        return this.request(`/semesters/${semesterId}`, {
            method: "DELETE",
        });
    }

    // ====== SUBJECT MANAGEMENT ======
    async getSubjects(filters?: SubjectFilters) {
        const params = filters
            ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
            : "";
        return this.request(`/subjects${params}`);
    }

    async getSubject(id: string) {
        return this.request(`/subjects/${id}`);
    }

    async getSubjectsBySemester(semesterId: string) {
        return this.request(`/subjects/semester/${semesterId}`);
    }

    async createSubject(subjectData: CreateSubjectRequest) {
        return this.request("/subjects", {
            method: "POST",
            body: JSON.stringify(subjectData),
        });
    }

    async updateSubject(id: string, subjectData: UpdateSubjectRequest) {
        return this.request(`/subjects/${id}`, {
            method: "PUT",
            body: JSON.stringify(subjectData),
        });
    }

    async deleteSubject(id: string) {
        return this.request(`/subjects/${id}`, {
            method: "DELETE",
        });
    }

    async createGrade(subjectId: string, gradeData: CreateGradeRequest) {
        return this.request(`/subjects/${subjectId}/grades`, {
            method: "POST",
            body: JSON.stringify(gradeData),
        });
    }

    // ====== EXAM MANAGEMENT ======
    async getExams(filters?: ExamFilters) {
        const params = filters
            ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
            : "";
        return this.request(`/exams${params}`);
    }

    async getExam(id: string) {
        return this.request(`/exams/${id}`);
    }

    async createExam(examData: CreateExamRequest) {
        return this.request("/exams", {
            method: "POST",
            body: JSON.stringify(examData),
        });
    }

    async updateExam(id: string, examData: UpdateExamRequest) {
        return this.request(`/exams/${id}`, {
            method: "PUT",
            body: JSON.stringify(examData),
        });
    }

    async deleteExam(id: string) {
        return this.request(`/exams/${id}`, {
            method: "DELETE",
        });
    }

    async createExamResult(
        examId: string,
        resultData: CreateExamResultRequest
    ) {
        return this.request(`/exams/${examId}/results`, {
            method: "POST",
            body: JSON.stringify(resultData),
        });
    }

    async getExamResults(examId: string) {
        return this.request(`/exams/${examId}/results`);
    }

    // ====== NOTICE MANAGEMENT ======
    async getNotices(filters?: NoticeFilters) {
        const params = filters
            ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
            : "";
        return this.request(`/notice${params}`);
    }

    async getNotice(id: string) {
        return this.request(`/notice/${id}`);
    }

    async createNotice(noticeData: CreateNoticeRequest) {
        return this.request("/notice", {
            method: "POST",
            body: JSON.stringify(noticeData),
        });
    }

    async updateNotice(id: string, noticeData: UpdateNoticeRequest) {
        return this.request(`/notice/${id}`, {
            method: "PUT",
            body: JSON.stringify(noticeData),
        });
    }

    async deleteNotice(id: string) {
        return this.request(`/notice/${id}`, {
            method: "DELETE",
        });
    }

    // ====== PAYMENT MANAGEMENT ======
    async getPayments(filters?: PaymentFilters) {
        const params = filters
            ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
            : "";
        return this.request(`/payments${params}`);
    }

    async getPayment(id: string) {
        return this.request(`/payments/${id}`);
    }

    async createPayment(paymentData: CreatePaymentRequest) {
        return this.request("/payments", {
            method: "POST",
            body: JSON.stringify(paymentData),
        });
    }

    async verifyPayment(id: string, verificationData: VerifyPaymentRequest) {
        return this.request(`/payments/${id}/verify`, {
            method: "POST",
            body: JSON.stringify(verificationData),
        });
    }

    async getPaymentSummary(userId: string) {
        return this.request(`/payments/summary/${userId}`);
    }

    async uploadReceipt(receiptData: CreateReceiptRequest) {
        return this.request(`/payments/${receiptData.paymentId}/receipts`, {
            method: "POST",
            body: JSON.stringify(receiptData),
        });
    }

    // ====== HEALTH CHECK ======
    async healthCheck() {
        return this.request("/health");
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
