"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { ProfessorHeader } from "@/components/professor-header"
import { ProfessorSidebar } from "@/components/professor-sidebar"
import { 
  CalendarDays, 
  ClipboardCheck, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Award,
  Clock
} from "lucide-react"

// Import existing academic components
import { AttendanceManagement } from "./attendance-management"
import { GradeManagement } from "./grade-management"
import { ResourceManagement } from "./resource-management"
import { AcademicCalendarManagement } from "./academic-calendar-management"

export function ProfessorDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  if (!user || user.role !== "PROFESSOR") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            This dashboard is only available for professors.
          </p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "attendance":
        return <AttendanceManagement />
      case "grades":
        return <GradeManagement />
      case "resources":
        return <ResourceManagement />
      case "calendar":
        return <AcademicCalendarManagement />
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome back, Prof. {user.name}!
                </h1>
                <p className="text-muted-foreground">
                  Manage your classes, grades, and resources from your dashboard.
                </p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Professor
              </Badge>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    My Sections
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Sections assigned to you
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Students
                  </CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Students in your sections
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Grades
                  </CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Grades pending submission
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    This Week&apos;s Classes
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Scheduled classes this week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities and Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>
                    Your latest actions in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          Marked attendance for CS101 Section A
                        </p>
                        <p className="text-xs text-muted-foreground">
                          2 hours ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          Added grades for Mid-term Exam
                        </p>
                        <p className="text-xs text-muted-foreground">
                          1 day ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          Uploaded new resource material
                        </p>
                        <p className="text-xs text-muted-foreground">
                          3 days ago
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks you can perform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <button
                      onClick={() => setActiveTab("attendance")}
                      className="flex items-center justify-between p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardCheck className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Mark Attendance</span>
                      </div>
                      <span className="text-xs text-muted-foreground">→</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("grades")}
                      className="flex items-center justify-between p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Add Grades</span>
                      </div>
                      <span className="text-xs text-muted-foreground">→</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("resources")}
                      className="flex items-center justify-between p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-purple-500" />
                        <span className="font-medium">Upload Resources</span>
                      </div>
                      <span className="text-xs text-muted-foreground">→</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("calendar")}
                      className="flex items-center justify-between p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">View Calendar</span>
                      </div>
                      <span className="text-xs text-muted-foreground">→</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar - Fixed height */}
      <ProfessorSidebar 
        className="flex-shrink-0" 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <ProfessorHeader title="Professor Dashboard" />
        
        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-auto bg-background p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}