// Authentication types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    universityId?: string;
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

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
    universityId?: string;
}

export interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
    confirmPassword: string;
}
