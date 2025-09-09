"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { AuthService, type LoginCredentials, type RegisterData, type AuthUser } from "@/lib/auth-service"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  forgotPassword: (email: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = AuthService.getStoredUser()
    const token = AuthService.getStoredToken()

    if (storedUser && token) {
      setUser(storedUser)
      // Optionally verify token with server
      AuthService.getCurrentUser()
        .then((response) => {
          if (response.success && response.user) {
            // Update user state with full user data, but keep AuthUser format for context
            const authUser: AuthUser = {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              role: response.user.role,
              universityId: response.user.universityId
            }
            setUser(authUser)
          } else {
            // Token invalid, clear storage
            AuthService.clearAuth()
            setUser(null)
          }
        })
        .catch(() => {
          AuthService.clearAuth()
          setUser(null)
        })
    }

    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await AuthService.login(credentials)

      if (response.success && response.user) {
        setUser(response.user)
        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.user.name}!`,
        })
        return true
      } else {
        toast({
          title: "Login Failed",
          description: response.message || "Invalid credentials",
          variant: "destructive",
        })
        return false
      }
    } catch {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await AuthService.register(userData)

      if (response.success) {
        toast({
          title: "Registration Successful",
          description: "Please check your email to verify your account",
        })
        return true
      } else {
        toast({
          title: "Registration Failed",
          description: response.message || "Registration failed",
          variant: "destructive",
        })
        return false
      }
    } catch {
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })
    router.push("/")
  }

  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await AuthService.forgotPassword(email)

      if (response.success) {
        toast({
          title: "Reset Link Sent",
          description: "Please check your email for password reset instructions",
        })
        return true
      } else {
        toast({
          title: "Reset Failed",
          description: response.message || "Failed to send reset email",
          variant: "destructive",
        })
        return false
      }
    } catch {
      toast({
        title: "Reset Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
