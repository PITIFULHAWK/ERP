"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, CheckCircle, AlertCircle, Eye, Download, RefreshCw } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { useApplication } from "@/contexts/application-context"
import { DOCUMENT_TYPES, REQUIRED_DOCUMENTS, OPTIONAL_DOCUMENTS, type DocumentType } from "@/lib/application"
import { Button } from "@/components/ui/button"

export function DocumentUploadForm() {
  const { application, uploadDocument, isLoading } = useApplication()
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  const handleFileUpload = async (documentType: DocumentType, file: File) => {
    setUploadProgress((prev) => ({ ...prev, [documentType]: 0 }))

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const current = prev[documentType] || 0
        if (current >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return { ...prev, [documentType]: current + 10 }
      })
    }, 200)

    const success = await uploadDocument(documentType, file)

    clearInterval(progressInterval)
    setUploadProgress((prev) => ({ ...prev, [documentType]: success ? 100 : 0 }))

    if (success) {
      setTimeout(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev }
          delete newProgress[documentType]
          return newProgress
        })
      }, 1000)
    }
  }

  const DocumentUploadCard = ({ documentType }: { documentType: DocumentType }) => {
    const isUploaded = application?.documentsUploaded?.includes(documentType)
    const isVerified = application?.documentsVerified?.includes(documentType)
    const isRequired = REQUIRED_DOCUMENTS.includes(documentType)
    const progress = uploadProgress[documentType]

    const onDrop = useCallback(
      (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
          handleFileUpload(documentType, acceptedFiles[0])
        }
      },
      [documentType],
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
      },
      maxFiles: 1,
      maxSize: 5 * 1024 * 1024, // 5MB
    })

    return (
      <Card
        className={`transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : ""
        } ${isVerified ? "border-green-500 bg-green-50 dark:bg-green-950" : ""}`}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>{DOCUMENT_TYPES[documentType]}</span>
            <div className="flex items-center gap-2">
              {isRequired && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
              {isUploaded && !isVerified && (
                <Badge variant="secondary" className="text-xs">
                  Uploaded
                </Badge>
              )}
              {isVerified && (
                <Badge variant="default" className="text-xs bg-green-600">
                  Verified
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progress !== undefined ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : isUploaded ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Document uploaded successfully</span>
                </div>
                {!isVerified && (
                  <div className="flex items-center gap-2 text-sm text-yellow-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Pending verification</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Replace
                </Button>
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">
                {isDragActive ? "Drop the file here" : "Drag & drop file here, or click to select"}
              </p>
              <p className="text-xs text-muted-foreground">Supports PDF, JPG, PNG (Max 5MB)</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const requiredDocsUploaded = REQUIRED_DOCUMENTS.filter((doc) => application?.documentsUploaded?.includes(doc)).length

  const totalRequiredDocs = REQUIRED_DOCUMENTS.length
  const completionPercentage = (requiredDocsUploaded / totalRequiredDocs) * 100

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Document Upload Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Required Documents</span>
              <span>
                {requiredDocsUploaded} of {totalRequiredDocs} uploaded
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {completionPercentage < 100 && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please upload all required documents to proceed with your application submission.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Required Documents */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REQUIRED_DOCUMENTS.map((documentType) => (
            <DocumentUploadCard key={documentType} documentType={documentType} />
          ))}
        </div>
      </div>

      {/* Optional Documents */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Optional Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OPTIONAL_DOCUMENTS.map((documentType) => (
            <DocumentUploadCard key={documentType} documentType={documentType} />
          ))}
        </div>
      </div>

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>All documents must be clear and legible</li>
            <li>Supported formats: PDF, JPG, PNG</li>
            <li>Maximum file size: 5MB per document</li>
            <li>Documents should be recent and valid</li>
            <li>Ensure all text is clearly visible</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
