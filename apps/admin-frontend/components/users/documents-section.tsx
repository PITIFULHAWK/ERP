"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Eye, 
  Download,
  AlertTriangle,
  Shield
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import type { Application } from "@/types/application"
import type { ApiResponse } from "@/types/api"

interface DocumentsSectionProps {
  application: Application | null
}

// Extended document type with verification fields
interface ExtendedDocument {
  id: string
  name: string
  type: string
  url: string
  isVerified?: boolean
  verifiedBy?: {
    id: string
    name: string
    email: string
  }
  verifiedAt?: string
  createdAt: string
  updatedAt: string
}

export function DocumentsSection({ application }: DocumentsSectionProps) {
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null)

  const handleVerifyDocument = async (documentId: string) => {
    try {
      setVerifyingDocId(documentId)
      const response = await apiClient.verifyDocument(documentId) as ApiResponse
      if (response.success) {
        toast({
          title: "Success",
          description: "Document verified successfully",
        })
        // Refresh the page to get updated data
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to verify document:", error)
      toast({
        title: "Error",
        description: "Failed to verify document",
        variant: "destructive",
      })
    } finally {
      setVerifyingDocId(null)
    }
  }

  const getDocumentStatusIcon = (isVerified: boolean) => {
    if (isVerified) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    return <Clock className="h-4 w-4 text-yellow-600" />
  }

  const getDocumentStatusBadge = (isVerified: boolean) => {
    if (isVerified) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
    }
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Cast documents to extended type for verification fields
  const documents = application?.documents as ExtendedDocument[] || []

  return (
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
        {documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((document) => (
              <div key={document.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getDocumentStatusIcon(document.isVerified || false)}
                    <div>
                      <h4 className="font-medium">{document.type}</h4>
                      <p className="text-sm text-muted-foreground">
                        Uploaded on {formatDate(document.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getDocumentStatusBadge(document.isVerified || false)}
                  </div>
                </div>

                {document.url && (
                  <div className="flex items-center space-x-2 mb-3">
                    <Button variant="outline" size="sm" asChild>
                      <a href={document.url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={document.url} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                )}

                {document.isVerified ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Verified</span>
                    </div>
                    {document.verifiedBy && (
                      <p className="text-sm text-green-700 mt-1">
                        Verified by {document.verifiedBy.name} on {document.verifiedAt ? formatDate(document.verifiedAt) : "N/A"}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Pending Verification</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleVerifyDocument(document.id)}
                      disabled={verifyingDocId === document.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {verifyingDocId === document.id ? "Verifying..." : "Verify Document"}
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {/* Documents Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Documents Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Documents:</span>
                  <span className="font-medium ml-2">{documents.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Verified:</span>
                  <span className="font-medium ml-2 text-green-600">
                    {documents.filter(doc => doc.isVerified).length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Pending:</span>
                  <span className="font-medium ml-2 text-yellow-600">
                    {documents.filter(doc => !doc.isVerified).length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Completion:</span>
                  <span className="font-medium ml-2">
                    {documents.length > 0 ? Math.round((documents.filter(doc => doc.isVerified).length / documents.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
            <p className="text-muted-foreground">
              {application ? "No documents have been uploaded for this application." : "User has not submitted an application yet."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
