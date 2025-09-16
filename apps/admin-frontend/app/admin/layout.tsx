import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "VERIFIER"]}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* Sidebar - Fixed height */}
        <AdminSidebar className="flex-shrink-0" />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Header */}
          <AdminHeader />
          
          {/* Main Content - Scrollable */}
          <main className="flex-1 overflow-auto bg-background p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
