import { apiClient, type ApiResponse } from "./api-client"

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  universityId: string
}

interface User {
  id: string
  name: string
  email: string
  role: "USER" | "STUDENT"
  userStatus: "VERIFIED" | "NOT_VERIFIED"
  universityId: string
  university: {
    id: string
    name: string
  }
  application?: any
  createdAt: string
}

interface AuthData {
  user: User
  token: string
}

export class EnhancedAuthAPI {
  static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthData>> {
    try {
      const response = await apiClient.post<AuthData>("/auth/login", credentials)

      if (response.success && response.data?.token) {
        localStorage.setItem("auth_token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
      }

      return response
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Login failed",
        error: error.message,
      }
    }
  }

  static async register(userData: RegisterData): Promise<ApiResponse<User>> {
    try {
      return await apiClient.post<User>("/users", userData)
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Registration failed",
        error: error.message,
      }
    }
  }

  static async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      return await apiClient.get<User>("/auth/me")
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to get user data",
        error: error.message,
      }
    }
  }

  static async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      return await apiClient.post<{ message: string }>("/auth/forgot-password", { email })
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to send reset email",
        error: error.message,
      }
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    try {
      return await apiClient.post<{ message: string }>("/auth/reset-password", {
        token,
        newPassword,
      })
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to reset password",
        error: error.message,
      }
    }
  }

  static async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      return await apiClient.patch<User>("/auth/profile", userData)
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update profile",
        error: error.message,
      }
    }
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    try {
      return await apiClient.post<{ message: string }>("/auth/change-password", {
        currentPassword,
        newPassword,
      })
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to change password",
        error: error.message,
      }
    }
  }

  static logout() {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
  }

  static getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem("user")
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  }

  static getStoredToken(): string | null {
    return localStorage.getItem("auth_token")
  }
}

export type { User, LoginCredentials, RegisterData, AuthData }
