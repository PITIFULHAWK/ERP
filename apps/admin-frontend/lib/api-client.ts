import {
    // User types
    User,
    UserFilters,
    CreateUserRequest,
    UpdateUserRequest,

    // University types
    University,
    UniversityFilters,
    CreateUniversityRequest,
    UpdateUniversityRequest,
    OnboardUniversityRequest,

    // Course types
    Course,
    CourseFilters,
    CreateCourseRequest,
    UpdateCourseRequest,
    Semester,
    Subject,
    Exam,
    ExamResult,
    Grade,

    // Application types
    Application,
    ApplicationFilters,
    CreateApplicationRequest,
    UpdateApplicationRequest,
    ApplicationStatusUpdate,
    VerifyApplicationRequest,

    // Hostel and Notice types from university
    UniversityHostel as Hostel,
    UniversityNotice as Notice,

    // Common types
    PaginatedResponse,

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
    UpdateExamResultRequest,
    ExamResultFilters,
    CreateNoticeRequest,
    UpdateNoticeRequest,
    NoticeFilters,
    
    // Payment types
    Payment,
    CreatePaymentRequest,
    PaymentSummary,
    CreateReceiptRequest,
    VerifyPaymentRequest,
    PaymentFilters,
    Receipt,
} from "../types";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

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
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("API request failed:", error);
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
        return this.request("/auth/me");
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
    async getCourses(filters?: CourseFilters) {
        const params = filters
            ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
            : "";
        return this.request(`/courses${params}`);
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

    async updateCourse(id: string, courseData: UpdateCourseRequest) {
        return this.request(`/courses/${id}`, {
            method: "PATCH",
            body: JSON.stringify(courseData),
        });
    }

    async deleteCourse(id: string) {
        return this.request(`/courses/${id}`, {
            method: "DELETE",
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
        return this.request(`/applications/${id}/verify`, {
            method: "PATCH",
            body: JSON.stringify(verificationData),
            headers: {
                ...this.getAuthHeaders(),
                "x-verifier-id": "admin-user-id", // This should be dynamically set based on current user
            },
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

    async verifyDocument(id: string) {
        return this.request(`/applications/documents/${id}/verify`, {
            method: "PATCH",
            headers: {
                ...this.getAuthHeaders(),
                "x-verifier-id": "admin-user-id", // This should be dynamically set
            },
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
