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
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import type { Application } from "@/types/application"
import type { VerifyApplicationRequest } from "@/types/api"
import { apiClient } from "@/lib/api-client"

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [verificationNotes, setVerificationNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getApplication(params.id as string)
        setApplication(((response as any)?.data ?? response) as Application)
        setLoading(false)
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
      console.log(`Verifying application ${application.id} with status ${status} by user ${user?.id}`)
      
      const request: VerifyApplicationRequest = {
        status,
        remarks: verificationNotes || undefined,
        verifierId: user?.id || "admin-user-id",
      }

      console.log("Verification request:", request)
      const response = await apiClient.verifyApplication(application.id, request)
      console.log("Verification response:", response)

      // Update local state
      setApplication({
        ...application,
        status,
        verificationNotes: verificationNotes || undefined,
        verifiedAt: new Date().toISOString(),
      })

      setVerificationNotes("")
      
      toast({
        title: "Success",
        description: `Application ${status.toLowerCase()} successfully`,
      })
    } catch (error) {
      console.error("Failed to verify application:", error)
      toast({
        title: "Error",
        description: `Failed to ${status.toLowerCase()} application: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDocumentVerification = async (documentId: string, isVerified: boolean, notes?: string) => {
    if (!application) return

    try {
      await apiClient.verifyDocument(documentId, user?.id || "admin-user-id")

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
                  <p className="text-sm">{application.user?.email || "N/A"}</p>
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
                  <p className="text-sm font-medium">{application.preferredCourse?.name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">Code: {application.preferredCourse?.code || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">University</Label>
                  <p className="text-sm">{application.preferredCourse?.university?.name || "N/A"}</p>
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
