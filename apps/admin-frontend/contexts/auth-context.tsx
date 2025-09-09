"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import type { AuthState, LoginCredentials, AuthResponse } from "@/types/auth"

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const router = useRouter()

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (token) {
          // Verify token and get user data
          const response: AuthResponse = await apiClient.getCurrentUser()
          if (response.success && response.data) {
            setState({
              user: response.data.user,
              token,
              isLoading: false,
              isAuthenticated: true,
            })
          } else {
            // Invalid token, clear it
            localStorage.removeItem("auth_token")
            setState({
              user: null,
              token: null,
              isLoading: false,
              isAuthenticated: false,
            })
          }
        } else {
          setState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } catch (error) {
        console.error("Auth initialization failed:", error)
        localStorage.removeItem("auth_token")
        setState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))

      const response: AuthResponse = await apiClient.login(credentials)

      if (response.success && response.data) {
        const { user, token } = response.data

        // Store token in localStorage
        localStorage.setItem("auth_token", token)

        setState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        })

        // Redirect based on user role
        if (user.role === "ADMIN" || user.role === "VERIFIER") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      } else {
        throw new Error(response.error || "Login failed")
      }
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    })
    router.push("/login")
  }

  const refreshUser = async () => {
    try {
      const response: AuthResponse = await apiClient.getCurrentUser()
      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          user: response.data!.user,
        }))
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
