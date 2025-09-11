"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  UserIcon, 
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  Shield,
  School,
  GraduationCap
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import type { Application } from "@/types/application"
import type { ApiResponse } from "@/types/api"

interface ApplicationSectionProps {
  application: Application | null
}

export function ApplicationSection({ application }: ApplicationSectionProps) {
  const [verifying, setVerifying] = useState(false)

  const handleVerifyApplication = async () => {
    if (!application) return
    
    try {
      setVerifying(true)
      const response = await apiClient.verifyApplication(application.id, {
        status: "VERIFIED",
        remarks: "Application verified by admin"
      }) as ApiResponse
      if (response.success) {
        toast({
          title: "Success",
          description: "Application verified successfully",
        })
        // Refresh the page to get updated data
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to verify application:", error)
      toast({
        title: "Error",
        description: "Failed to verify application",
        variant: "destructive",
      })
    } finally {
      setVerifying(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "UNDER_REVIEW":
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>
      case "UNDER_REVIEW":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Under Review</Badge>
      case "INCOMPLETE":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Incomplete</Badge>
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!application) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Application
          </CardTitle>
          <CardDescription>
            Student application details and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Application Found</h3>
            <p className="text-muted-foreground">
              This user has not submitted an application yet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Application Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Application Status
              </CardTitle>
              <CardDescription>
                Current status and verification details
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(application.status)}
              {getStatusBadge(application.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Application ID</label>
              <p className="text-sm font-mono">{application.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Submitted On</label>
              <p className="text-sm">{formatDate(application.createdAt)}</p>
            </div>
            {application.verifiedBy && (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Verified By</label>
                  <p className="text-sm">{application.verifiedBy.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Verified On</label>
                  <p className="text-sm">{application.verifiedAt ? formatDate(application.verifiedAt) : "N/A"}</p>
                </div>
              </>
            )}
          </div>

          {application.verificationNotes && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="text-sm font-medium text-blue-800">Verification Notes</label>
              <p className="text-sm text-blue-700 mt-1">{application.verificationNotes}</p>
            </div>
          )}

          {application.rejectionReason && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <label className="text-sm font-medium text-red-800">Rejection Reason</label>
              <p className="text-sm text-red-700 mt-1">{application.rejectionReason}</p>
            </div>
          )}

          {application.status !== "VERIFIED" && application.status !== "REJECTED" && (
            <div className="mt-4 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Ready for Verification</span>
              </div>
              <Button
                onClick={handleVerifyApplication}
                disabled={verifying}
                className="bg-green-600 hover:bg-green-700"
              >
                {verifying ? "Verifying..." : "Verify Application"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-sm">{application.firstName} {application.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                <p className="text-sm">{formatDate(application.dateOfBirth)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gender</label>
                <p className="text-sm">{application.gender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                <p className="text-sm">{application.nationality}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <p className="text-sm">{application.phoneNumber}</p>
              </div>
              {application.alternatePhoneNumber && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Alternate Phone</label>
                  <p className="text-sm">{application.alternatePhoneNumber}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="text-sm">{application.address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">City, State</label>
                <p className="text-sm">{application.city}, {application.state} - {application.pincode}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <School className="h-5 w-5 mr-2" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Class 10 Details */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Class 10 Details</h4>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Percentage</label>
                <p className="text-sm">{application.class10Percentage}%</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Board</label>
                <p className="text-sm">{application.class10Board}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Year of Passing</label>
                <p className="text-sm">{application.class10YearOfPassing}</p>
              </div>
            </div>

            {/* Class 12 Details */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Class 12 Details</h4>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Percentage</label>
                <p className="text-sm">{application.class12Percentage}%</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Board</label>
                <p className="text-sm">{application.class12Board}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Stream</label>
                <p className="text-sm">{application.class12Stream}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Year of Passing</label>
                <p className="text-sm">{application.class12YearOfPassing}</p>
              </div>
            </div>
          </div>

          {/* JEE Mains Information */}
          {application.hasJeeMainsScore && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-lg mb-3">JEE Mains Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Score</label>
                  <p className="text-sm">{application.jeeMainsScore}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rank</label>
                  <p className="text-sm">{application.jeeMainsRank}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Year</label>
                  <p className="text-sm">{application.jeeMainsYear}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferred Course */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Preferred Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Course Name</label>
              <p className="text-lg font-medium">{application.preferredCourse.name}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Course Code</label>
                <p className="text-sm">{application.preferredCourse.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Credits</label>
                <p className="text-sm">{application.preferredCourse.credits}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                <p className="text-sm">{application.preferredCourse.totalSemester} semesters</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Fees</label>
                <p className="text-sm">₹{application.preferredCourse.totalFees.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">University</label>
              <p className="text-sm">{application.preferredCourse.university.name} - {application.preferredCourse.university.location}</p>
              <Badge variant="outline" className="mt-1">
                {application.preferredCourse.university.type}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
