"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { ApplicationProvider } from "@/contexts/application-context"
import { ApplicationWizard } from "@/components/application/application-wizard"

export default function ApplicationPage() {
  return (
    <ProtectedRoute>
      <ApplicationProvider>
        <ApplicationWizard />
      </ApplicationProvider>
    </ProtectedRoute>
  )
}
