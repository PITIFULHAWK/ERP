"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { ProfileManagement } from "@/components/profile/profile-management"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileManagement />
    </ProtectedRoute>
  )
}
