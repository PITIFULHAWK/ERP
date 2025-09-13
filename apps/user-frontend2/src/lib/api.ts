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
    role: "STUDENT" | "PROFESSOR" | "VERIFIER" | "ADMIN";
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
