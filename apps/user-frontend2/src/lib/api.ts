// API Configuration and Service Layer
// Prefer environment variable for flexibility; fallback to localhost for dev
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

// Types for API responses
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

// Placements
export type PlacementStatus = "ACTIVE" | "CLOSED" | "DRAFT";

export interface Placement {
    id: string;
    title: string;
    description: string;
    companyName: string;
    position: string;
    packageOffered?: string | null;
    cgpaCriteria?: number | null;
    location?: string | null;
    applicationDeadline?: string | null;
    status: PlacementStatus;
    emailsSent?: number | null;
    createdAt: string;
    updatedAt: string;
}

// Attendance types
export interface AttendanceSubjectInfo {
    id: string;
    name: string;
    code: string;
    credits: number;
}

export interface AttendanceSectionInfo {
    id: string;
    name: string;
    code?: string;
}

export interface AttendanceRecord {
    id: string;
    studentId: string;
    enrollmentId: string;
    subjectId: string | null;
    sectionId: string;
    date: string;
    classType: "REGULAR" | "LAB" | "EXTRA" | string;
    status: "PRESENT" | "ABSENT" | "LATE" | string;
    markedAt: string;
    markedBy: string;
    subject?: AttendanceSubjectInfo | null;
    section?: AttendanceSectionInfo;
    markedByUser?: { id: string; name: string };
}

export interface AttendanceSummary {
    id: string;
    studentId: string;
    subjectId: string;
    academicYearId: string;
    totalClasses: number;
    presentClasses: number;
    absentClasses: number;
    attendancePercentage: number;
    subject: AttendanceSubjectInfo;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: "USER" | "STUDENT" | "PROFESSOR" | "VERIFIER" | "ADMIN";
    userStatus?: "VERIFIED" | "NOT_VERIFIED";
    universityId: string;
    university?: University;
    currentSemesterInfo?: number;
}

export interface University {
    id: string;
    name: string;
}

// Pagination helper
export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// Complaints
export type ComplaintCategory =
    | "HOSTEL"
    | "ACADEMIC"
    | "INFRASTRUCTURE"
    | "FOOD"
    | "TRANSPORT"
    | "LIBRARY"
    | "MEDICAL"
    | "FINANCIAL"
    | "ADMINISTRATIVE"
    | "DISCIPLINARY"
    | "TECHNICAL"
    | "OTHER";

export type ComplaintStatus =
    | "OPEN"
    | "IN_PROGRESS"
    | "PENDING_INFO"
    | "RESOLVED"
    | "CLOSED"
    | "ESCALATED";

export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Complaint {
    id: string;
    title: string;
    description: string;
    category: ComplaintCategory;
    status: ComplaintStatus;
    priority?: ComplaintPriority;
    location?: string;
    urgency?: boolean;
    attachmentUrls?: string[];
    studentId: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string | null;
    resolutionNote?: string | null;
    student?: { id: string; name: string; email: string };
    resolver?: { id: string; name: string; email: string } | null;
    assignedAdmin?: { id: string; name: string; email: string } | null;
    _count?: { updates: number };
}

export interface ComplaintUpdate {
    id: string;
    complaintId: string;
    updatedBy: string;
    updateType: "COMMENT" | "STATUS_CHANGE" | "RESOLUTION" | "ASSIGNMENT";
    message: string;
    isInternal: boolean;
    createdAt: string;
    updater?: { id: string; name: string; email: string; role: string };
}

export interface ComplaintDetail extends Complaint {
    updates: ComplaintUpdate[];
}

export interface ComplaintCreateRequest {
    title: string;
    description: string;
    category: ComplaintCategory;
    priority?: ComplaintPriority;
    location?: string;
    urgency?: boolean;
    attachmentUrls?: string[];
}

export interface ComplaintQuery {
    status?: ComplaintStatus;
    category?: ComplaintCategory;
    priority?: ComplaintPriority;
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt" | "priority" | "status";
    sortOrder?: "asc" | "desc";
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
    type: "COURSE" | "HOSTEL" | "LIBRARY" | "MISC" | "SUMMERQUARTER";
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
    type: "COURSE" | "HOSTEL" | "LIBRARY" | "MISC" | "SUMMERQUARTER";
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
    credits: number;
    totalSemester: number;
    totalFees: number;
    currentStudents: number;
    universityId: string;
    createdAt: string;
    updatedAt: string;
    university?: University;
    _count?: {
        enrollments: number;
        applications: number;
    };
}

export interface Application {
    id: string;
    userId: string;
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
    preferredCourseId: string;
    status: "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "INCOMPLETE";
    verifiedById?: string;
    verifiedAt?: string;
    verificationNotes?: string;
    rejectionReason?: string;
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

// Academic Calendar and Timetable Document Interfaces
export interface AcademicYear {
    id: string;
    year: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export interface SectionInfo {
    id: string;
    name: string;
    courseId: string;
    academicYearId: string;
    course?: Course;
}

export interface CalendarDocument {
    id: string;
    url: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    uploadedAt: string;
    lastModified: string;
    academicYear: AcademicYear;
    calendarPdfUrl?: string; // Optional property for backward compatibility
}

export interface TimetableDocument {
    id: string;
    url: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    uploadedAt: string;
    lastModified: string;
    section: SectionInfo;
    academicYear: AcademicYear;
}

export interface StudentEnrollment {
    id: string;
    studentId: string;
    sectionId: string;
    academicYearId: string;
    enrollmentDate: string;
    status: "ACTIVE" | "INACTIVE" | "COMPLETED";
    section: SectionInfo;
    academicYear: AcademicYear;
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
}

// API Service Class
class ApiService {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    // User profile (includes cgpa and academicRecord)
    async getUserProfile(): Promise<ApiResponse<User & { cgpa?: number; academicRecord?: any }>> {
        return this.request<User & { cgpa?: number; academicRecord?: any }>(
            `/users/profile`
        );
    }

    // Complaints endpoints
    async createComplaint(payload: ComplaintCreateRequest): Promise<ApiResponse<Complaint>> {
        return this.request<Complaint>(`/complaints`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    async getComplaints(params?: ComplaintQuery): Promise<ApiResponse<{ complaints: Complaint[]; pagination: Pagination }>> {
        const qp = new URLSearchParams();
        if (params?.status) qp.append("status", params.status);
        if (params?.category) qp.append("category", params.category);
        if (params?.priority) qp.append("priority", params.priority);
        if (params?.page) qp.append("page", String(params.page));
        if (params?.limit) qp.append("limit", String(params.limit));
        if (params?.sortBy) qp.append("sortBy", params.sortBy);
        if (params?.sortOrder) qp.append("sortOrder", params.sortOrder);
        const query = qp.toString();
        return this.request<{ complaints: Complaint[]; pagination: Pagination }>(
            `/complaints${query ? `?${query}` : ""}`
        );
    }

    async getComplaintById(id: string): Promise<ApiResponse<ComplaintDetail>> {
        return this.request<ComplaintDetail>(`/complaints/${id}`);
    }

    async addComplaintUpdate(id: string, payload: { message: string; isInternal?: boolean }): Promise<ApiResponse<ComplaintUpdate>> {
        return this.request<ComplaintUpdate>(`/complaints/${id}/updates`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }

    // Placements endpoints
    async getPlacements(params?: { status?: PlacementStatus; page?: number; limit?: number }): Promise<ApiResponse<{ placements: Placement[]; pagination: Pagination }>> {
        const qp = new URLSearchParams();
        if (params?.status) qp.append("status", params.status);
        if (params?.page) qp.append("page", String(params.page));
        if (params?.limit) qp.append("limit", String(params.limit));
        const query = qp.toString();
        // Backend response returns data: { placements, pagination }
        return this.request<{ placements: Placement[]; pagination: Pagination }>(
            `/placements${query ? `?${query}` : ""}`
        );
    }

    async getPlacementById(id: string): Promise<ApiResponse<Placement>> {
        return this.request<Placement>(`/placements/${id}`);
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
    async getCourses(params?: { universityId?: string }): Promise<ApiResponse<Course[]>> {
        const queryParams = new URLSearchParams();
        if (params?.universityId) {
            queryParams.append("universityId", params.universityId);
        }
        const query = queryParams.toString();
        return this.request<Course[]>(`/courses${query ? `?${query}` : ""}`);
    }

    // Hostels endpoint
    async getHostels(): Promise<ApiResponse<any[]>> {
        return this.request<any[]>("/hostels");
    }

    // Payment endpoints
    async getPayments(params?: {
        userId?: string;
        type?: "COURSE" | "HOSTEL" | "LIBRARY" | "MISC" | "SUMMERQUARTER";
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

    // Academic Calendar endpoints
    async getStudentCalendar(studentId: string): Promise<ApiResponse<CalendarDocument>> {
        return this.request<CalendarDocument>(`/academic-calendar/student/${studentId}`);
    }

    async getStudentEnrollments(studentId: string): Promise<ApiResponse<StudentEnrollment[]>> {
        // Backend exposes sectionRoutes: GET /sections/student/:studentId
        return this.request<StudentEnrollment[]>(`/sections/student/${studentId}`);
    }

    // Timetable endpoints
    async getStudentTimetable(studentId: string): Promise<ApiResponse<TimetableDocument>> {
        // Backend mounts timetables router at /timetables
        return this.request<TimetableDocument>(`/timetables/student/${studentId}`);
    }

    async getTimetableBySection(sectionId: string): Promise<ApiResponse<TimetableDocument>> {
        // Backend exposes GET /timetables/:sectionId
        return this.request<TimetableDocument>(`/timetables/${sectionId}`);
    }

    // Attendance endpoints
    async getStudentAttendance(
        studentId: string,
        params?: { subjectId?: string; semesterId?: string; academicYearId?: string }
    ): Promise<ApiResponse<{ records: AttendanceRecord[]; summaries: AttendanceSummary[] }>> {
        const queryParams = new URLSearchParams();
        if (params?.subjectId) queryParams.append("subjectId", params.subjectId);
        if (params?.semesterId) queryParams.append("semesterId", params.semesterId);
        if (params?.academicYearId)
            queryParams.append("academicYearId", params.academicYearId);
        const query = queryParams.toString();
        return this.request<{ records: AttendanceRecord[]; summaries: AttendanceSummary[] }>(
            `/attendance/student/${studentId}${query ? `?${query}` : ""}`
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
