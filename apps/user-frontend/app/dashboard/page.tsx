"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { ApplicationProvider } from "@/contexts/application-context"
import { StudentDashboard } from "@/components/dashboard/student-dashboard"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <ApplicationProvider>
        <StudentDashboard />
      </ApplicationProvider>
    </ProtectedRoute>
  )
}
