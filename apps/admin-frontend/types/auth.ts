export interface User {
  id: string
  name: string
  email: string
  role: "USER" | "STUDENT" | "PROFESSOR" | "ADMIN" | "VERIFIER"
  userStatus: "VERIFIED" | "NOT_VERIFIED"
  universityId: string
  university: {
    id: string
    name: string
    uid: number
  }
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: User
    token: string
  }
  error?: string
}
