"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import type { User, LoginRequest } from "@/types"

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user && !!token

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("auth_token")
        const storedUser = localStorage.getItem("auth_user")
        
        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error)
        // Clear invalid data
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      const response = await apiClient.login(credentials) as {
        success: boolean
        message?: string
        data?: {
          user: {
            id: string
            name: string
            email: string
            role: string
            universityId?: string
          }
          token: string
        }
      }
      
      if (response.success && response.data && response.data.user && response.data.token) {
        const { user: userData, token: authToken } = response.data
        
        // Store token and user data in localStorage
        localStorage.setItem("auth_token", authToken)
        
        // Convert the response user to the expected User type
        const fullUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role as "USER" | "STUDENT" | "PROFESSOR" | "ADMIN" | "VERIFIER",
          userStatus: "VERIFIED" as const,
          universityId: userData.universityId || "",
          university: {
            id: "",
            name: ""
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        // Store user data in localStorage
        localStorage.setItem("auth_user", JSON.stringify(fullUser))
        
        // Update state
        setToken(authToken)
        setUser(fullUser)
        
        // Redirect based on user role
        if (userData.role === "PROFESSOR") {
          router.push("/professor")
        } else {
          router.push("/admin")
        }
      } else {
        throw new Error(response.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    
    // Clear state
    setToken(null)
    setUser(null)
    
    // Redirect to login
    router.push("/login")
  }

  const refreshUser = async () => {
    try {
      // Since we don't have a getCurrentUser endpoint, we'll just reload from localStorage
      const storedUser = localStorage.getItem("auth_user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
      // If refresh fails, logout user
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
