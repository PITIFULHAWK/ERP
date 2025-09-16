import type React from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={["PROFESSOR"]}>
      {children}
    </ProtectedRoute>
  )
}