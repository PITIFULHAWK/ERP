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
    CourseFilters,
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
