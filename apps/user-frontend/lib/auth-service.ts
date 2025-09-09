import { apiClient } from "./api-client";
import {
    LoginRequest,
    RegisterRequest,
    User,
    AuthUser,
    ResetPasswordRequest,
} from "../types";

export class AuthService {
    // Store auth data
    static storeAuth(token: string, user: AuthUser): void {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(user));
    }

    // Get stored auth data
    static getStoredToken(): string | null {
        return localStorage.getItem("auth_token");
    }

    static getStoredUser(): AuthUser | null {
        const userStr = localStorage.getItem("auth_user");
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    // Clear auth data
    static clearAuth(): void {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
    }

    // Check if user is authenticated
    static isAuthenticated(): boolean {
        const token = this.getStoredToken();
        const user = this.getStoredUser();
        return !!(token && user);
    }

    // Login
    static async login(
        credentials: LoginRequest
    ): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
        try {
            const response = await apiClient.login(credentials);

            if (response.success && response.data) {
                const { token, user } = response.data;
                this.storeAuth(token, user);
                return { success: true, user };
            }

            return { success: false, message: response.message };
        } catch (error: unknown) {
            return {
                success: false,
                message:
                    error instanceof Error ? error.message : "Login failed",
            };
        }
    }

    // Register
    static async register(
        userData: RegisterRequest
    ): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await apiClient.register(userData);

            if (response.success) {
                return { success: true, message: response.message };
            }

            return { success: false, message: response.message };
        } catch (error: unknown) {
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Registration failed",
            };
        }
    }

    // Get current user profile
    static async getCurrentUser(): Promise<{
        success: boolean;
        user?: User;
        message?: string;
    }> {
        try {
            const response = await apiClient.getCurrentUser();

            if (response.success && response.data) {
                return { success: true, user: response.data };
            }

            return { success: false, message: response.message };
        } catch (error: unknown) {
            // If token is invalid, clear auth data
            if (
                error instanceof Error &&
                "status" in error &&
                (error as { status: number }).status === 401
            ) {
                this.clearAuth();
            }

            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to get user data",
            };
        }
    }

    // Forgot password
    static async forgotPassword(
        email: string
    ): Promise<{ success: boolean; message?: string }> {
        try {
            // This endpoint doesn't exist in backend yet, but we'll prepare for it
            const response = await apiClient.post("/users/forgot-password", {
                email,
            });

            if (response.success) {
                return { success: true, message: response.message };
            }

            return { success: false, message: response.message };
        } catch (error: unknown) {
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to send reset email",
            };
        }
    }

    // Reset password
    static async resetPassword(
        data: ResetPasswordRequest
    ): Promise<{ success: boolean; message?: string }> {
        try {
            // This endpoint doesn't exist in backend yet, but we'll prepare for it
            const response = await apiClient.post(
                "/users/reset-password",
                data
            );

            if (response.success) {
                return { success: true, message: response.message };
            }

            return { success: false, message: response.message };
        } catch (error: unknown) {
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to reset password",
            };
        }
    }

    // Logout
    static logout(): void {
        this.clearAuth();
    }

    // Update profile
    static async updateProfile(
        userId: string,
        data: { name?: string; email?: string }
    ): Promise<{ success: boolean; user?: User; message?: string }> {
        try {
            const response = await apiClient.updateProfile(userId, data);

            if (response.success && response.data) {
                // Update stored user data
                const currentUser = this.getStoredUser();
                if (currentUser) {
                    const updatedUser = { ...currentUser, ...data };
                    localStorage.setItem(
                        "auth_user",
                        JSON.stringify(updatedUser)
                    );
                }

                return { success: true, user: response.data };
            }

            return { success: false, message: response.message };
        } catch (error: unknown) {
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to update profile",
            };
        }
    }
}

// Export for backward compatibility with existing code
export const AuthAPI = AuthService;

// Export types
export type {
    LoginRequest as LoginCredentials,
    RegisterRequest as RegisterData,
    User,
    AuthUser,
};
