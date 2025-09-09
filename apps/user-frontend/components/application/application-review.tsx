"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, FileText, Send } from "lucide-react"
import { useApplication } from "@/contexts/application-context"
import { DOCUMENT_TYPES, REQUIRED_DOCUMENTS } from "@/lib/application"

export function ApplicationReview() {
  const { application, formData, submitApplication, isLoading } = useApplication()

  const handleSubmit = async () => {
    const success = await submitApplication()
    if (success) {
      // Redirect to success page or show success message
    }
  }

  const requiredDocsUploaded = REQUIRED_DOCUMENTS.filter((doc) => application?.documentsUploaded?.includes(doc)).length

  const isReadyToSubmit =
    requiredDocsUploaded === REQUIRED_DOCUMENTS.length &&
    formData.personalInfo &&
    formData.addressInfo &&
    formData.academicInfo &&
    formData.coursePreference

  return (
    <div className="space-y-6">
      {/* Submission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Application Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isReadyToSubmit ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Your application is complete and ready for submission!</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please complete all required sections before submitting your application.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Personal Information Review */}
      {formData.personalInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span>
                <p className="text-muted-foreground">
                  {formData.personalInfo.firstName} {formData.personalInfo.lastName}
                </p>
              </div>
              <div>
                <span className="font-medium">Date of Birth:</span>
                <p className="text-muted-foreground">{formData.personalInfo.dateOfBirth}</p>
              </div>
              <div>
                <span className="font-medium">Gender:</span>
                <p className="text-muted-foreground">{formData.personalInfo.gender}</p>
              </div>
              <div>
                <span className="font-medium">Phone:</span>
                <p className="text-muted-foreground">{formData.personalInfo.phoneNumber}</p>
              </div>
              <div>
                <span className="font-medium">Nationality:</span>
                <p className="text-muted-foreground">{formData.personalInfo.nationality}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address Information Review */}
      {formData.addressInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Address Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <span className="font-medium">Permanent Address:</span>
                <p className="text-muted-foreground">
                  {formData.addressInfo.address}, {formData.addressInfo.city}, {formData.addressInfo.state} -{" "}
                  {formData.addressInfo.pincode}
                </p>
              </div>
              {!formData.addressInfo.sameAsPermament && formData.addressInfo.correspondenceAddress && (
                <div>
                  <span className="font-medium">Correspondence Address:</span>
                  <p className="text-muted-foreground">
                    {formData.addressInfo.correspondenceAddress}, {formData.addressInfo.correspondenceCity},{" "}
                    {formData.addressInfo.correspondenceState} - {formData.addressInfo.correspondencePincode}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Academic Information Review */}
      {formData.academicInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Academic Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <span className="font-medium">Class 10:</span>
                <p className="text-muted-foreground">
                  {formData.academicInfo.class10Percentage}% - {formData.academicInfo.class10Board} (
                  {formData.academicInfo.class10YearOfPassing})
                </p>
              </div>
              <div>
                <span className="font-medium">Class 12:</span>
                <p className="text-muted-foreground">
                  {formData.academicInfo.class12Percentage}% - {formData.academicInfo.class12Board} (
                  {formData.academicInfo.class12YearOfPassing})
                </p>
              </div>
              <div>
                <span className="font-medium">Stream:</span>
                <p className="text-muted-foreground">{formData.academicInfo.class12Stream}</p>
              </div>
              {formData.academicInfo.hasJeeMainsScore && (
                <div>
                  <span className="font-medium">JEE Mains:</span>
                  <p className="text-muted-foreground">
                    Score: {formData.academicInfo.jeeMainsScore}, Rank: {formData.academicInfo.jeeMainsRank} (
                    {formData.academicInfo.jeeMainsYear})
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Preference Review */}
      {formData.coursePreference && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Preference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Preferred Course ID:</span>
                <p className="text-muted-foreground">{formData.coursePreference.preferredCourseId}</p>
              </div>
              {formData.coursePreference.alternativeCourseId && (
                <div>
                  <span className="font-medium">Alternative Course ID:</span>
                  <p className="text-muted-foreground">{formData.coursePreference.alternativeCourseId}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Status Review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Document Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {REQUIRED_DOCUMENTS.map((docType) => {
              const isUploaded = application?.documentsUploaded?.includes(docType)
              const isVerified = application?.documentsVerified?.includes(docType)

              return (
                <div key={docType} className="flex items-center justify-between">
                  <span className="text-sm">{DOCUMENT_TYPES[docType]}</span>
                  <div className="flex items-center gap-2">
                    {isUploaded ? (
                      <Badge variant={isVerified ? "default" : "secondary"} className="text-xs">
                        {isVerified ? "Verified" : "Uploaded"}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Missing
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button size="lg" onClick={handleSubmit} disabled={!isReadyToSubmit || isLoading} className="min-w-48">
          {isLoading ? (
            "Submitting..."
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Application
            </>
          )}
        </Button>
      </div>

      {!isReadyToSubmit && (
        <div className="text-center text-sm text-muted-foreground">
          Complete all required sections to enable submission
        </div>
      )}
    </div>
  )
}
