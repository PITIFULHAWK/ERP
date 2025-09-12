"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, FileText, GraduationCap, Building2, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import type { Application } from "@/types/application"

interface DashboardStats {
  totalApplications: number
  totalUsers: number
  totalCourses: number
  totalUniversities: number
  applicationStatusCounts: {
    pending: number
    under_review: number
    verified: number
    rejected: number
    incomplete: number
  }
  recentApplications: Application[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch data from existing endpoints in parallel
      const results = await Promise.all([
        apiClient.getApplications(),
        apiClient.getUsers(),
        apiClient.getCourses(),
        apiClient.getUniversities()
      ])

      const [applicationsRes, usersRes, coursesRes, universitiesRes] = results

      // Debug: Log the responses to understand the structure
      console.log("API Responses:", {
        applicationsRes,
        usersRes,
        coursesRes,
        universitiesRes
      })

      // Handle different possible response structures
      const extractData = (response: unknown) => {
        const res = response as { success?: boolean; data?: unknown }
        // Check if response has success property and data
        if (res?.success && res?.data) {
          const data = res.data as { data?: unknown[] } | unknown[]
          // If data has a 'data' property (paginated), use that
          if ('data' in data && data.data && Array.isArray(data.data)) {
            return data.data
          }
          // If data is directly an array, use it
          if (Array.isArray(data)) {
            return data
          }
          // If data is an object with array properties, try to find the array
          if (typeof data === 'object' && data !== null) {
            const keys = Object.keys(data)
            for (const key of keys) {
              const value = (data as Record<string, unknown>)[key]
              if (Array.isArray(value)) {
                return value
              }
            }
          }
        }
        // Return empty array if no valid data found
        return []
      }

      const applications = extractData(applicationsRes)
      const users = extractData(usersRes)
      const courses = extractData(coursesRes)
      const universities = extractData(universitiesRes)

      console.log("Extracted data:", {
        applications: applications.length,
        users: users.length,
        courses: courses.length,
        universities: universities.length
      })

      // Calculate status counts
      const statusCounts = applications.reduce((acc: Record<string, number>, app: Application) => {
        const status = app.status.toLowerCase()
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})

      // Get recent applications (last 5)
      const recentApplications = applications
        .sort((a: Application, b: Application) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

      setStats({
        totalApplications: applications.length,
        totalUsers: users.length,
        totalCourses: courses.length,
        totalUniversities: universities.length,
        applicationStatusCounts: {
          pending: statusCounts.pending || 0,
          under_review: statusCounts.under_review || 0,
          verified: statusCounts.verified || 0,
          rejected: statusCounts.rejected || 0,
          incomplete: statusCounts.incomplete || 0
        },
        recentApplications
      })

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      toast({
        title: "Error", 
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
        return "default"
      case "under_review":
        return "secondary"
      case "rejected":
        return "destructive"
      case "incomplete":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
        return <CheckCircle className="w-3 h-3 mr-1" />
      case "under_review":
        return <Clock className="w-3 h-3 mr-1" />
      case "rejected":
      case "incomplete":
        return <AlertCircle className="w-3 h-3 mr-1" />
      default:
        return null
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
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

  if (!stats) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Unable to load dashboard</h3>
              <p className="text-muted-foreground mb-4">There was an error loading the dashboard data.</p>
              <Button onClick={fetchDashboardData}>Try again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-3 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                All time applications
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-3 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Registered users
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-2 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Available courses
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Universities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUniversities}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-chart-4">Partner institutions</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-playfair">Recent Applications</CardTitle>
            <CardDescription>Latest application submissions requiring review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentApplications.length > 0 ? (
                stats.recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{application.user.name}</p>
                        <p className="text-sm text-muted-foreground">{application.preferredCourse.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={getStatusBadgeVariant(application.status)}>
                        {getStatusIcon(application.status)}
                        {application.status.replace("_", " ").toLowerCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(application.createdAt)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent applications</p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/admin/applications">View All Applications</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-playfair">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link href="/admin/applications">
                <FileText className="w-4 h-4 mr-2" />
                Review Applications
              </Link>
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link href="/admin/users">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Link>
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link href="/admin/universities/create">
                <Building2 className="w-4 h-4 mr-2" />
                Add University
              </Link>
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
              <Link href="/admin/courses/create">
                <GraduationCap className="w-4 h-4 mr-2" />
                Create Course
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-playfair">Application Status Overview</CardTitle>
          <CardDescription>Current status distribution of all applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-chart-4">{stats.applicationStatusCounts.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-chart-2">{stats.applicationStatusCounts.under_review}</div>
              <div className="text-sm text-muted-foreground">Under Review</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-chart-3">{stats.applicationStatusCounts.verified}</div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-chart-1">{stats.applicationStatusCounts.rejected}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-destructive">{stats.applicationStatusCounts.incomplete}</div>
              <div className="text-sm text-muted-foreground">Incomplete</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
