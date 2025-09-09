"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { ApplicationProvider } from "@/contexts/application-context"
import { ApplicationStatusTracker } from "@/components/application/application-status-tracker"

export default function ApplicationStatusPage() {
  return (
    <ProtectedRoute>
      <ApplicationProvider>
        <ApplicationStatusTracker />
      </ApplicationProvider>
    </ProtectedRoute>
  )
}
