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

interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: User
    token: string
  }
  error?: string
}

const API_BASE_URL = "http://localhost:5000/api/v1"

export class AuthAPI {
  private static getAuthHeaders() {
    const token = localStorage.getItem("auth_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (data.success && data.data?.token) {
        localStorage.setItem("auth_token", data.data.token)
        localStorage.setItem("user", JSON.stringify(data.data.user))
      }

      return data
    } catch (error) {
      return {
        success: false,
        message: "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        message: "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  static async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders(),
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        message: "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  static async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        message: "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
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

export type { User, LoginCredentials, RegisterData, AuthResponse }
