"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Shield,
  Clock,
  AlertTriangle,
  UserCheck,
  UserX,
  UserIcon,
  FileText
} from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import { UserRoleBadge } from "@/components/users/user-role-badge"
import { UserStatusBadge } from "@/components/users/user-status-badge"
import type { User } from "@/types/user"
import type { ApiResponse } from "@/types/api"

type UserRole = "STUDENT" | "PROFESSOR" | "VERIFIER" | "ADMIN"

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getUser(userId) as ApiResponse<User>
        if (response.success && response.data) {
          setUser(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
        toast({
          title: "Error",
          description: "Failed to load user details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    }
  }, [userId])

  const handleVerifyUser = async () => {
    if (!user) return
    
    try {
      setActionLoading("verify")
      const response = await apiClient.updateUser(user.id, { userStatus: "VERIFIED" }) as ApiResponse<User>
      if (response.success) {
        setUser({ ...user, userStatus: "VERIFIED" })
        toast({
          title: "Success",
          description: "User verified successfully",
        })
      }
    } catch (error) {
      console.error("Failed to verify user:", error)
      toast({
        title: "Error",
        description: "Failed to verify user",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateRole = async (newRole: string) => {
    if (!user) return
    
    try {
      setActionLoading("role")
      const response = await apiClient.updateUserRole(user.id, newRole as UserRole) as ApiResponse<User>
      if (response.success) {
        setUser({ ...user, role: newRole as UserRole })
        toast({
          title: "Success",
          description: `User role updated to ${newRole}`,
        })
      }
    } catch (error) {
      console.error("Failed to update role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!user || !confirm("Are you sure you want to delete this user? This action cannot be undone.")) return
    
    try {
      setActionLoading("delete")
      const response = await apiClient.deleteUser(user.id) as ApiResponse
      if (response.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
        router.push("/admin/users")
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading user details...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-4">The user you&apos;re looking for doesn&apos;t exist.</p>
          <Button asChild>
            <Link href="/admin/users">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-playfair font-bold">User Profile</h1>
            <p className="text-muted-foreground">View and manage user details</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {user.userStatus === "NOT_VERIFIED" && (
            <Button
              onClick={handleVerifyUser}
              disabled={actionLoading === "verify"}
              className="bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              {actionLoading === "verify" ? "Verifying..." : "Verify User"}
            </Button>
          )}
          
          {user.role === "USER" && (
            <Button
              onClick={() => handleUpdateRole("STUDENT")}
              disabled={actionLoading === "role"}
              variant="outline"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              {actionLoading === "role" ? "Updating..." : "Promote to Student"}
            </Button>
          )}
          
          <Button
            onClick={handleDeleteUser}
            disabled={actionLoading === "delete"}
            variant="destructive"
          >
            <UserX className="w-4 h-4 mr-2" />
            {actionLoading === "delete" ? "Deleting..." : "Delete User"}
          </Button>
        </div>
      </div>

      {/* User Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`/placeholder-user.jpg`} alt={user.name} />
              <AvatarFallback>
                {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user.email}</span>
              </div>
              <div className="flex items-center space-x-4">
                <UserRoleBadge role={user.role} />
                <UserStatusBadge status={user.userStatus} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                University
              </div>
              <p className="font-medium">{user.university?.name || "No university assigned"}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Joined
              </div>
              <p className="font-medium">{formatDate(user.createdAt)}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                Last Updated
              </div>
              <p className="font-medium">{formatDate(user.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="hostel">Hostel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-sm">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                  <p className="text-sm">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <p className="text-sm font-mono">{user.id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <div className="mt-1">
                    <UserRoleBadge role={user.role} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                  <div className="mt-1">
                    <UserStatusBadge status={user.userStatus} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                  <p className="text-sm">{formatDate(user.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="application">
          {user.application ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Application Details
                </CardTitle>
                <CardDescription>
                  Student application information and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="text-sm">{user.application.firstName} {user.application.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                      <p className="text-sm">{user.application.phoneNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <p className="text-sm">{user.application.address}, {user.application.city}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">
                        <Badge variant={user.application.status === "VERIFIED" ? "default" : "secondary"}>
                          {user.application.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Class 10 Percentage</label>
                      <p className="text-sm">{user.application.class10Percentage}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Class 12 Percentage</label>
                      <p className="text-sm">{user.application.class12Percentage}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Preferred Course</label>
                      <p className="text-sm">{user.application.preferredCourse.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Application Date</label>
                      <p className="text-sm">{formatDate(user.application.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Application Found</h3>
                  <p className="text-muted-foreground">This user has not submitted an application yet.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents">
          {user.application && user.application.documents && user.application.documents.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Documents
                </CardTitle>
                <CardDescription>
                  Application documents and verification status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.application.documents.map((document) => (
                    <div key={document.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{document.type}</h4>
                            <p className="text-sm text-muted-foreground">
                              Uploaded on {formatDate(document.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={document.isVerified ? "default" : "secondary"}>
                          {document.isVerified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                      {document.url && (
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={document.url} target="_blank" rel="noopener noreferrer">
                              View Document
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
                  <p className="text-muted-foreground">
                    {user.application ? "No documents have been uploaded for this application." : "User has not submitted an application yet."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Enrolled Courses
              </CardTitle>
              <CardDescription>
                Courses this user is currently enrolled in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.coursesOpted && user.coursesOpted.length > 0 ? (
                <div className="space-y-3">
                  {user.coursesOpted.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{course.name}</h4>
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                      </div>
                      <Badge variant="outline">{course.duration} months</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No courses enrolled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hostel">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Hostel Information
              </CardTitle>
              <CardDescription>
                Hostel accommodation details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.hostelOpted ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Hostel Name</label>
                    <p className="text-sm">{user.hostelOpted.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="text-sm">{user.hostelOpted.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fee per Month</label>
                    <p className="text-sm">₹{user.hostelOpted.feePerMonth.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Capacity</label>
                    <p className="text-sm">{user.hostelOpted.capacity} students</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hostel accommodation</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
