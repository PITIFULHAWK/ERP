"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<"USER" | "STUDENT" | "PROFESSOR" | "ADMIN" | "VERIFIER">
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles = ["ADMIN", "VERIFIER"],
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
        return
      }

      if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect based on user role
        if (user.role === "STUDENT") {
          router.push("/student")
        } else if (user.role === "PROFESSOR") {
          router.push("/professor")
        } else {
          router.push("/unauthorized")
        }
        return
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, redirectTo, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
    return null
  }

  return <>{children}</>
}
