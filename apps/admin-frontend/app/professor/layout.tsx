import type React from "react"
import { ProfessorSidebar } from "@/components/professor-sidebar"
import { ProfessorHeader } from "@/components/professor-header"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={["PROFESSOR"]}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* Sidebar - Fixed height */}
        <ProfessorSidebar className="flex-shrink-0" />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Header */}
          <ProfessorHeader />
          
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