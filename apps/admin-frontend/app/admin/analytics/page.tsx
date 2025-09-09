"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MetricCard } from "@/components/analytics/metric-card"
import { ApplicationStatusChart } from "@/components/analytics/application-status-chart"
import { MonthlyTrendsChart } from "@/components/analytics/monthly-trends-chart"
import { UserRoleChart } from "@/components/analytics/user-role-chart"
import { RevenueChart } from "@/components/analytics/revenue-chart"
import { Users, GraduationCap, BookOpen, FileText, Download } from "lucide-react"
import type { SystemMetrics, ApplicationAnalytics, UserAnalytics, FinancialReport } from "@/types/analytics"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API calls
  const systemMetrics: SystemMetrics = {
    totalUsers: 15420,
    totalUniversities: 245,
    totalCourses: 1850,
    totalApplications: 8920,
    pendingApplications: 1240,
    verifiedApplications: 6180,
    rejectedApplications: 1500,
    monthlyGrowth: {
      users: 12.5,
      applications: 8.3,
      universities: 5.2,
    },
  }

  const applicationAnalytics: ApplicationAnalytics = {
    statusDistribution: [
      { status: "VERIFIED", count: 6180, percentage: 69.3 },
      { status: "PENDING", count: 1240, percentage: 13.9 },
      { status: "REJECTED", count: 1500, percentage: 16.8 },
    ],
    monthlyTrends: [
      { month: "Jan", submitted: 720, verified: 580, rejected: 140 },
      { month: "Feb", submitted: 850, verified: 680, rejected: 170 },
      { month: "Mar", submitted: 920, verified: 750, rejected: 170 },
      { month: "Apr", submitted: 1100, verified: 890, rejected: 210 },
      { month: "May", submitted: 1250, verified: 1020, rejected: 230 },
      { month: "Jun", submitted: 1180, verified: 980, rejected: 200 },
    ],
    processingTimes: {
      average: 5.2,
      median: 4.8,
      fastest: 1.2,
      slowest: 12.5,
    },
  }

  const userAnalytics: UserAnalytics = {
    roleDistribution: [
      { role: "STUDENT", count: 12800, percentage: 83.0 },
      { role: "PROFESSOR", count: 1850, percentage: 12.0 },
      { role: "VERIFIER", count: 520, percentage: 3.4 },
      { role: "ADMIN", count: 250, percentage: 1.6 },
    ],
    verificationStatus: {
      verified: 13200,
      unverified: 2220,
    },
    monthlyRegistrations: [
      { month: "Jan", count: 1200 },
      { month: "Feb", count: 1450 },
      { month: "Mar", count: 1680 },
      { month: "Apr", count: 1920 },
      { month: "May", count: 2100 },
      { month: "Jun", count: 1850 },
    ],
  }

  const financialReport: FinancialReport = {
    totalRevenue: 45600000,
    monthlyRevenue: [
      { month: "Jan", amount: 6800000 },
      { month: "Feb", amount: 7200000 },
      { month: "Mar", amount: 7800000 },
      { month: "Apr", amount: 8200000 },
      { month: "May", amount: 8900000 },
      { month: "Jun", amount: 8400000 },
    ],
    feeCollection: {
      collected: 38400000,
      pending: 5200000,
      overdue: 2000000,
    },
    universityWiseRevenue: [
      { universityName: "Delhi University", amount: 8500000 },
      { universityName: "Mumbai University", amount: 7200000 },
      { universityName: "Bangalore University", amount: 6800000 },
    ],
  }

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [timeRange])

  const handleExportReport = () => {
    // Implement export functionality
    console.log("Exporting analytics report...")
  }

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
          <Button onClick={handleExportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={systemMetrics.totalUsers.toLocaleString()}
          change={systemMetrics.monthlyGrowth.users}
          icon={<Users className="h-4 w-4 text-primary" />}
        />
        <MetricCard
          title="Universities"
          value={systemMetrics.totalUniversities.toLocaleString()}
          change={systemMetrics.monthlyGrowth.universities}
          icon={<GraduationCap className="h-4 w-4 text-primary" />}
        />
        <MetricCard
          title="Total Courses"
          value={systemMetrics.totalCourses.toLocaleString()}
          icon={<BookOpen className="h-4 w-4 text-primary" />}
        />
        <MetricCard
          title="Applications"
          value={systemMetrics.totalApplications.toLocaleString()}
          change={systemMetrics.monthlyGrowth.applications}
          icon={<FileText className="h-4 w-4 text-primary" />}
        />
      </div>

      {/* Application Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApplicationStatusChart data={applicationAnalytics.statusDistribution} />
        <MonthlyTrendsChart data={applicationAnalytics.monthlyTrends} />
      </div>

      {/* User Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserRoleChart data={userAnalytics.roleDistribution} />
        <Card>
          <CardHeader>
            <CardTitle>Processing Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average</span>
                <span className="font-semibold">{applicationAnalytics.processingTimes.average} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Median</span>
                <span className="font-semibold">{applicationAnalytics.processingTimes.median} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Fastest</span>
                <span className="font-semibold text-green-600">
                  {applicationAnalytics.processingTimes.fastest} days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Slowest</span>
                <span className="font-semibold text-red-600">{applicationAnalytics.processingTimes.slowest} days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={financialReport.monthlyRevenue} />
        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Collected</span>
                <span className="font-semibold text-green-600">
                  ₹{(financialReport.feeCollection.collected / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-semibold text-yellow-600">
                  ₹{(financialReport.feeCollection.pending / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Overdue</span>
                <span className="font-semibold text-red-600">
                  ₹{(financialReport.feeCollection.overdue / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Revenue Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {financialReport.universityWiseRevenue.map((university, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground truncate">{university.universityName}</span>
                  <span className="font-semibold">₹{(university.amount / 1000000).toFixed(1)}M</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
