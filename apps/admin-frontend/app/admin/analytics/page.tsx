"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MetricCard } from "@/components/analytics/metric-card"
import { ApplicationStatusChart } from "@/components/analytics/application-status-chart"
import { UserRoleChart } from "@/components/analytics/user-role-chart"
import { Users, GraduationCap, BookOpen, FileText, Building, Bell, UserCheck, UserX, RefreshCw, Clock, AlertCircle } from "lucide-react"
import type { SystemMetrics, ApplicationAnalytics, UserAnalytics } from "@/types/analytics"

export default function AnalyticsPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState("30d")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [applicationAnalytics, setApplicationAnalytics] = useState<ApplicationAnalytics | null>(null)
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [totalNotices, setTotalNotices] = useState(0)
  const [totalHostels, setTotalHostels] = useState(0)
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalFaculty, setTotalFaculty] = useState(0)
  const [verifiedUsers, setVerifiedUsers] = useState(0)
  const [unverifiedUsers, setUnverifiedUsers] = useState(0)
  const [totalCourses, setTotalCourses] = useState(0)
  interface ActivityItem {
    type: 'notice' | 'application'
    title: string
    time: string
    icon: React.ReactNode
  }

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])

  const load = async () => {
      // Calculate metrics from fetched data
      interface ApiResponse<T> {
        success: boolean
        data: T[]
      }

      interface User {
        role: string
        userStatus: string
      }

      interface Application {
        status: string
        user?: { name: string }
        createdAt: string
      }

      interface Notice {
        title: string
        publishedAt?: string
        createdAt: string
      }


      let totalCourses = 0
      let totalStudents = 0
      let totalFaculty = 0
      let totalNotices = 0
      let totalHostels = 0
      let verifiedUsers = 0
      let unverifiedUsers = 0

      try {
        setLoading(true)
        // Fetch data for single university analytics
        const [users, courses, applications, notices, hostels] = await Promise.all([
          apiClient.getUsers({}).catch(() => ({ success: true, data: [] })),
          apiClient.getCourses({}).catch(() => ({ success: true, data: [] })),
          apiClient.getApplications({}).catch(() => ({ success: true, data: [] })),
          apiClient.getNotices().catch(() => ({ success: true, data: [] })),
          apiClient.getHostels({}).catch(() => ({ success: true, data: [] })),
        ])

        const usersList = (users as ApiResponse<User>).data || []
        const coursesList = (courses as ApiResponse<unknown>).data || []
        const noticesList = (notices as ApiResponse<Notice>).data || []
        const hostelsList = (hostels as ApiResponse<unknown>).data || []
        const apps = (applications as ApiResponse<Application>).data || []

        // Calculate user metrics
        const totalUsers = usersList.length
        totalStudents = usersList.filter((u: User) => u.role === 'STUDENT').length
        totalFaculty = usersList.filter((u: User) => u.role === 'PROFESSOR').length
        verifiedUsers = usersList.filter((u: User) => u.userStatus === 'VERIFIED').length
        unverifiedUsers = totalUsers - verifiedUsers

        // Calculate other metrics
        totalCourses = coursesList.length
        totalNotices = noticesList.length
        totalHostels = hostelsList.length

        const pendingApplications = apps.filter((a: Application) => a.status === "PENDING").length
        const verifiedApplications = apps.filter((a: Application) => a.status === "VERIFIED").length
        const rejectedApplications = apps.filter((a: Application) => a.status === "REJECTED").length

        // Set additional state
        setTotalNotices(totalNotices)
        setTotalHostels(totalHostels)
        setTotalStudents(totalStudents)
        setTotalFaculty(totalFaculty)
        setVerifiedUsers(verifiedUsers)
        setUnverifiedUsers(unverifiedUsers)
        setTotalCourses(totalCourses)

        setSystemMetrics({
          totalUsers,
          totalUniversities: 1, // Single university setup
          totalCourses,
          totalApplications: apps.length,
          pendingApplications,
          verifiedApplications,
          rejectedApplications,
          monthlyGrowth: { users: 0, applications: 0, universities: 0 },
        })

        setApplicationAnalytics({
          statusDistribution: [
            { status: "VERIFIED", count: verifiedApplications, percentage: apps.length ? (verifiedApplications / apps.length) * 100 : 0 },
            { status: "PENDING", count: pendingApplications, percentage: apps.length ? (pendingApplications / apps.length) * 100 : 0 },
            { status: "REJECTED", count: rejectedApplications, percentage: apps.length ? (rejectedApplications / apps.length) * 100 : 0 },
          ],
          monthlyTrends: [],
          processingTimes: { average: 0, median: 0, fastest: 0, slowest: 0 },
        })

        setUserAnalytics({
          roleDistribution: [
            { role: "STUDENT", count: totalStudents, percentage: totalUsers ? (totalStudents / totalUsers) * 100 : 0 },
            { role: "PROFESSOR", count: totalFaculty, percentage: totalUsers ? (totalFaculty / totalUsers) * 100 : 0 },
            { role: "ADMIN", count: usersList.filter((u: User) => u.role === 'ADMIN').length, percentage: totalUsers ? (usersList.filter((u: User) => u.role === 'ADMIN').length / totalUsers) * 100 : 0 },
          ],
          verificationStatus: { verified: verifiedUsers, unverified: unverifiedUsers },
          monthlyRegistrations: [],
        })

        // Generate recent activity
        const activity: ActivityItem[] = [
          ...noticesList.slice(0, 3).map((notice: Notice) => ({
            type: 'notice' as const,
            title: notice.title,
            time: notice.publishedAt || notice.createdAt,
            icon: <Bell className="h-4 w-4" />
          })),
          ...apps.slice(0, 2).map((app: Application) => ({
            type: 'application' as const,
            title: `New application from ${app.user?.name || 'Student'}`,
            time: app.createdAt,
            icon: <FileText className="h-4 w-4" />
          }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)

        setRecentActivity(activity)

      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

  const handleRefresh = async () => {
    setRefreshing(true)
    await load()
  }

  useEffect(() => {
    load()
  }, [timeRange]) // eslint-disable-line react-hooks/exhaustive-deps


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">Comprehensive insights into system performance and metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Students"
          value={totalStudents.toLocaleString()}
          icon={<Users className="h-4 w-4 text-primary" />}
        />
        <MetricCard
          title="Total Faculty"
          value={totalFaculty.toLocaleString()}
          icon={<GraduationCap className="h-4 w-4 text-primary" />}
        />
        <MetricCard
          title="Total Courses"
          value={totalCourses.toLocaleString()}
          icon={<BookOpen className="h-4 w-4 text-primary" />}
        />
        <MetricCard
          title="Total Notices"
          value={totalNotices.toLocaleString()}
          icon={<Bell className="h-4 w-4 text-primary" />}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Hostels"
          value={totalHostels.toLocaleString()}
          icon={<Building className="h-4 w-4 text-primary" />}
        />
        <MetricCard
          title="Verified Users"
          value={verifiedUsers.toLocaleString()}
          icon={<UserCheck className="h-4 w-4 text-green-600" />}
        />
        <MetricCard
          title="Unverified Users"
          value={unverifiedUsers.toLocaleString()}
          icon={<UserX className="h-4 w-4 text-red-600" />}
        />
        <MetricCard
          title="Applications"
          value={(systemMetrics?.totalApplications ?? 0).toLocaleString()}
          icon={<FileText className="h-4 w-4 text-primary" />}
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unverifiedUsers > 0 && (
              <Button 
                onClick={() => router.push('/admin/users')} 
                variant="outline" 
                className="w-full justify-start"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Verify {unverifiedUsers} Pending Users
              </Button>
            )}
            {(systemMetrics?.pendingApplications ?? 0) > 0 && (
              <Button 
                onClick={() => router.push('/admin/applications')} 
                variant="outline" 
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                Review {systemMetrics?.pendingApplications} Applications
              </Button>
            )}
            <Button 
              onClick={() => router.push('/admin/notices')} 
              variant="outline" 
              className="w-full justify-start"
            >
              <Bell className="h-4 w-4 mr-2" />
              Create New Notice
            </Button>
            <Button 
              onClick={() => router.push('/admin/courses')} 
              variant="outline" 
              className="w-full justify-start"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Manage Courses
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="text-muted-foreground mt-1">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.time).toLocaleDateString()} at {new Date(item.time).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <ApplicationStatusChart data={applicationAnalytics?.statusDistribution ?? []} />
      </div>

      {/* User Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <UserRoleChart data={userAnalytics?.roleDistribution ?? []} />
      </div>

    </div>
  )
}
