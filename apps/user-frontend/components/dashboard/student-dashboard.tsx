"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  User,
  GraduationCap,
  Calendar,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  Download,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useApplication } from "@/contexts/application-context"
import { REQUIRED_DOCUMENTS } from "@/lib/application"

export function StudentDashboard() {
  const { user } = useAuth()
  const { application } = useApplication()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "default"
      case "UNDER_REVIEW":
        return "secondary"
      case "PENDING":
        return "outline"
      case "REJECTED":
        return "destructive"
      case "INCOMPLETE":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle className="h-4 w-4" />
      case "UNDER_REVIEW":
        return <Clock className="h-4 w-4" />
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "REJECTED":
        return <AlertCircle className="h-4 w-4" />
      case "INCOMPLETE":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const requiredDocsUploaded =
    application?.documentsUploaded?.filter((doc) => REQUIRED_DOCUMENTS.includes(doc)).length || 0

  const documentProgress = (requiredDocsUploaded / REQUIRED_DOCUMENTS.length) * 100

  const recentNotifications = [
    {
      id: 1,
      title: "Application Status Updated",
      message: "Your application is now under review",
      time: "2 hours ago",
      type: "info",
    },
    {
      id: 2,
      title: "Document Verification",
      message: "Class 12 marksheet has been verified",
      time: "1 day ago",
      type: "success",
    },
    {
      id: 3,
      title: "Fee Payment Reminder",
      message: "Application fee payment due in 3 days",
      time: "2 days ago",
      type: "warning",
    },
  ]

  const quickActions = [
    {
      title: "Continue Application",
      description: "Complete your application form",
      icon: <FileText className="h-5 w-5" />,
      href: "/application",
      variant: "default" as const,
    },
    {
      title: "Upload Documents",
      description: "Upload required documents",
      icon: <Plus className="h-5 w-5" />,
      href: "/application?step=4",
      variant: "outline" as const,
    },
    {
      title: "View Profile",
      description: "Manage your profile settings",
      icon: <User className="h-5 w-5" />,
      href: "/profile",
      variant: "outline" as const,
    },
    {
      title: "Track Status",
      description: "Check application progress",
      icon: <Eye className="h-5 w-5" />,
      href: "/application/status",
      variant: "outline" as const,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.name?.split(" ")[0]}!</h1>
            <p className="text-muted-foreground">
              Here's an overview of your application progress and important updates.
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Application Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Application Status</CardTitle>
                {getStatusIcon(application?.status || "DRAFT")}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">
                  <Badge variant={getStatusColor(application?.status || "DRAFT")}>
                    {application?.status?.replace("_", " ") || "Not Started"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {application?.lastUpdated
                    ? `Updated ${new Date(application.lastUpdated).toLocaleDateString()}`
                    : "Start your application"}
                </p>
              </CardContent>
            </Card>

            {/* Documents Progress */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">
                  {requiredDocsUploaded}/{REQUIRED_DOCUMENTS.length}
                </div>
                <Progress value={documentProgress} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">{Math.round(documentProgress)}% complete</p>
              </CardContent>
            </Card>

            {/* University */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">University</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1 text-balance">{user?.university?.name || "Not Selected"}</div>
                <p className="text-xs text-muted-foreground">Preferred institution</p>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">
                  <Badge variant={user?.userStatus === "VERIFIED" ? "default" : "secondary"}>
                    {user?.userStatus?.replace("_", " ") || "Pending"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Email verification status</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Application Progress */}
              {application && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Application Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Completion</span>
                        <span className="text-sm text-muted-foreground">
                          {application.status === "DRAFT" ? "In Progress" : "Submitted"}
                        </span>
                      </div>

                      {application.status === "DRAFT" ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Your application is saved as a draft. Complete all sections and submit for review.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Your application has been submitted and is being reviewed by our admissions team.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2">
                        <Button asChild>
                          <Link href="/application">
                            {application.status === "DRAFT" ? "Continue Application" : "View Application"}
                          </Link>
                        </Button>
                        {application.status !== "DRAFT" && (
                          <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                      <Button key={index} variant={action.variant} className="h-auto p-4 justify-start" asChild>
                        <Link href={action.href}>
                          <div className="flex items-start gap-3">
                            {action.icon}
                            <div className="text-left">
                              <div className="font-medium">{action.title}</div>
                              <div className="text-sm text-muted-foreground">{action.description}</div>
                            </div>
                          </div>
                        </Link>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {application ? (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Application Updated</p>
                          <p className="text-xs text-muted-foreground">
                            Last modified: {new Date(application.lastUpdated).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No recent activity</p>
                        <p className="text-sm">Start your application to see updates here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentNotifications.map((notification) => (
                      <div key={notification.id} className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium mb-1">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
                    View All Notifications
                  </Button>
                </CardContent>
              </Card>

              {/* Important Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Important Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <Link href="/courses">Browse Courses</Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <Link href="/universities">View Universities</Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <Link href="/notices">Latest Notices</Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <Link href="/help">Help & Support</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our support team is here to help you with any questions about your application.
                  </p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
