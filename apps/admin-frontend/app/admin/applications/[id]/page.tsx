"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge"
import { DocumentVerification } from "@/components/applications/document-verification"
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText } from "lucide-react"
import type { Application, VerificationRequest } from "@/types/application"

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [verificationNotes, setVerificationNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock application data
  const mockApplication: Application = {
    id: params.id as string,
    firstName: "Sarah",
    lastName: "Johnson",
    dateOfBirth: "2000-05-15",
    gender: "FEMALE",
    nationality: "Indian",
    phoneNumber: "+91-9876543210",
    alternatePhoneNumber: "+91-9876543211",
    address: "123 Main Street, Apartment 4B",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    class10Percentage: 85.5,
    class10Board: "CBSE",
    class10YearOfPassing: 2018,
    class12Percentage: 88.2,
    class12Board: "CBSE",
    class12YearOfPassing: 2020,
    class12Stream: "Science",
    hasJeeMainsScore: true,
    jeeMainsScore: 245,
    jeeMainsRank: 15000,
    jeeMainsYear: 2020,
    preferredCourseId: "cs-1",
    preferredCourse: {
      id: "cs-1",
      name: "Computer Science Engineering",
      code: "CSE",
      university: {
        id: "univ-1",
        name: "Indian Institute of Technology",
      },
    },
    status: "PENDING",
    documents: [
      {
        id: "doc-1",
        type: "CLASS_10_MARKSHEET",
        fileName: "class10_marksheet.pdf",
        fileUrl: "/class-10-marksheet-document.jpg",
        fileSize: 245760,
        mimeType: "application/pdf",
        isVerified: true,
        verifiedBy: { id: "admin-1", name: "Admin User" },
        verifiedAt: "2024-01-16T10:30:00Z",
        applicationId: params.id as string,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-16T10:30:00Z",
      },
      {
        id: "doc-2",
        type: "CLASS_12_MARKSHEET",
        fileName: "class12_marksheet.pdf",
        fileUrl: "/class-12-marksheet-document.jpg",
        fileSize: 312480,
        mimeType: "application/pdf",
        isVerified: false,
        applicationId: params.id as string,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "doc-3",
        type: "PHOTO",
        fileName: "passport_photo.jpg",
        fileUrl: "/passport-photo-of-student.jpg",
        fileSize: 89120,
        mimeType: "image/jpeg",
        isVerified: false,
        applicationId: params.id as string,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },
    ],
    user: {
      id: "user-1",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
    },
    userId: "user-1",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  }

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true)
        // In a real app: const response = await apiClient.getApplication(params.id as string)
        setTimeout(() => {
          setApplication(mockApplication)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch application:", error)
        setLoading(false)
      }
    }

    fetchApplication()
  }, [params.id])

  const handleVerifyApplication = async (status: "VERIFIED" | "REJECTED" | "INCOMPLETE") => {
    if (!application) return

    try {
      setIsSubmitting(true)
      const request: VerificationRequest = {
        status,
        notes: verificationNotes || undefined,
      }

      // In a real app: await apiClient.verifyApplication(application.id, request)
      console.log("Verifying application:", request)

      // Update local state
      setApplication({
        ...application,
        status,
        verificationNotes: verificationNotes || undefined,
        verifiedAt: new Date().toISOString(),
      })

      setVerificationNotes("")
    } catch (error) {
      console.error("Failed to verify application:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDocumentVerification = async (documentId: string, isVerified: boolean, notes?: string) => {
    if (!application) return

    try {
      // In a real app: await apiClient.verifyDocument(documentId, { isVerified, notes })
      console.log("Verifying document:", { documentId, isVerified, notes })

      // Update local state
      const updatedDocuments = application.documents.map((doc) =>
        doc.id === documentId
          ? {
              ...doc,
              isVerified,
              verifiedAt: isVerified ? new Date().toISOString() : undefined,
              verifiedBy: isVerified ? { id: "admin-1", name: "Current Admin" } : undefined,
            }
          : doc,
      )

      setApplication({
        ...application,
        documents: updatedDocuments,
      })
    } catch (error) {
      console.error("Failed to verify document:", error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <Clock className="w-6 h-6 animate-spin mr-2" />
          Loading application details...
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Application Not Found</h2>
          <p className="text-muted-foreground">The requested application could not be found.</p>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
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
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-playfair font-bold">
              {application.firstName} {application.lastName}
            </h1>
            <p className="text-muted-foreground">Application ID: {application.id}</p>
          </div>
        </div>
        <ApplicationStatusBadge status={application.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-sm">
                    {application.firstName} {application.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                  <p className="text-sm">{new Date(application.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                  <p className="text-sm">{application.gender}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nationality</Label>
                  <p className="text-sm">{application.nationality}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                  <p className="text-sm">{application.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{application.user.email}</p>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <p className="text-sm">
                  {application.address}, {application.city}, {application.state} - {application.pincode}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair">Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Class 10</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Percentage:</span>
                      <span className="text-sm font-medium">{application.class10Percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Board:</span>
                      <span className="text-sm">{application.class10Board}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Year:</span>
                      <span className="text-sm">{application.class10YearOfPassing}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Class 12</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Percentage:</span>
                      <span className="text-sm font-medium">{application.class12Percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Board:</span>
                      <span className="text-sm">{application.class12Board}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Stream:</span>
                      <span className="text-sm">{application.class12Stream}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Year:</span>
                      <span className="text-sm">{application.class12YearOfPassing}</span>
                    </div>
                  </div>
                </div>
              </div>

              {application.hasJeeMainsScore && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">JEE Mains</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Score:</span>
                        <span className="text-sm font-medium">{application.jeeMainsScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Rank:</span>
                        <span className="text-sm font-medium">{application.jeeMainsRank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Year:</span>
                        <span className="text-sm">{application.jeeMainsYear}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Course Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair">Course Preference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Preferred Course</Label>
                  <p className="text-sm font-medium">{application.preferredCourse.name}</p>
                  <p className="text-sm text-muted-foreground">Code: {application.preferredCourse.code}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">University</Label>
                  <p className="text-sm">{application.preferredCourse.university.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair">Documents</CardTitle>
              <CardDescription>Review and verify uploaded documents</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentVerification documents={application.documents} onVerifyDocument={handleDocumentVerification} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair">Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <ApplicationStatusBadge status={application.status} />
              </div>

              {application.status === "VERIFIED" && application.verifiedAt && (
                <div className="text-sm text-center text-muted-foreground">
                  Verified on {new Date(application.verifiedAt).toLocaleDateString()}
                </div>
              )}

              {application.verificationNotes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1">{application.verificationNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Actions */}
          {(application.status === "PENDING" || application.status === "UNDER_REVIEW") && (
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair">Verification</CardTitle>
                <CardDescription>Review and make a decision on this application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Verification Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes about your decision..."
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => handleVerifyApplication("VERIFIED")}
                    disabled={isSubmitting}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => handleVerifyApplication("INCOMPLETE")}
                    disabled={isSubmitting}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Mark Incomplete
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleVerifyApplication("REJECTED")}
                    disabled={isSubmitting}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Application Submitted</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {application.status !== "PENDING" && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-chart-2 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Under Review</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(application.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {application.verifiedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-chart-3 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Decision Made</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(application.verifiedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
