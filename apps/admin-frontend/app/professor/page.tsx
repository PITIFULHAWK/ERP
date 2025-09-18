"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { 
  CalendarDays, 
  ClipboardCheck, 
  BookOpen, 
  GraduationCap,
  Users,
  Award
} from "lucide-react"
import Link from "next/link"

export default function ProfessorPage() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    loading: true,
    stats: {
      totalSections: 0,
      totalStudents: 0,
      pendingAttendance: 0,
      pendingGrades: 0
    }
  })

  useEffect(() => {
    // Fetch dashboard stats here
    // For now, just simulating loading
    setTimeout(() => {
      setDashboardData({
        loading: false,
        stats: {
          totalSections: 5,
          totalStudents: 142,
          pendingAttendance: 3,
          pendingGrades: 8
        }
      })
    }, 1000)
  }, [])

  if (dashboardData.loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your classes today.
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Professor Dashboard
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Sections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalSections}</div>
            <p className="text-xs text-muted-foreground">
              Active sections this semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all your sections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Attendance</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.pendingAttendance}</div>
            <p className="text-xs text-muted-foreground">
              Classes requiring attendance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.pendingGrades}</div>
            <p className="text-xs text-muted-foreground">
              Assignments to grade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Link href="/professor/attendance">
                <div className="flex items-center justify-between p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Mark Attendance</span>
                  </div>
                  <span className="text-xs text-muted-foreground">→</span>
                </div>
              </Link>
              
              <Link href="/professor/grades">
                <div className="flex items-center justify-between p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Add Grades</span>
                  </div>
                  <span className="text-xs text-muted-foreground">→</span>
                </div>
              </Link>
              
              <Link href="/professor/resources">
                <div className="flex items-center justify-between p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Upload Resources</span>
                  </div>
                  <span className="text-xs text-muted-foreground">→</span>
                </div>
              </Link>
              
              <Link href="/professor/calendar">
                <div className="flex items-center justify-between p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">View Calendar</span>
                  </div>
                  <span className="text-xs text-muted-foreground">→</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Marked attendance</p>
                  <p className="text-xs text-muted-foreground">CS101 - Section A</p>
                </div>
                <span className="text-xs text-muted-foreground">2h ago</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Uploaded resource</p>
                  <p className="text-xs text-muted-foreground">Data Structures Notes</p>
                </div>
                <span className="text-xs text-muted-foreground">1d ago</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Graded assignment</p>
                  <p className="text-xs text-muted-foreground">Quiz 1 - 25 students</p>
                </div>
                <span className="text-xs text-muted-foreground">2d ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Today&apos;s Schedule
          </CardTitle>
          <CardDescription>
            Your classes and activities for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">CS101 - Data Structures</p>
                  <p className="text-sm text-muted-foreground">Section A • Room 101</p>
                </div>
              </div>
              <Badge variant="outline">9:00 AM - 10:30 AM</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">CS102 - Algorithms</p>
                  <p className="text-sm text-muted-foreground">Section B • Room 205</p>
                </div>
              </div>
              <Badge variant="outline">11:00 AM - 12:30 PM</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-muted rounded-full"></div>
                <div>
                  <p className="font-medium">Office Hours</p>
                  <p className="text-sm text-muted-foreground">Available for student consultations</p>
                </div>
              </div>
              <Badge variant="secondary">2:00 PM - 4:00 PM</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}