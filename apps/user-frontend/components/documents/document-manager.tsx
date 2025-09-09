"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Eye, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw } from "lucide-react"
import { DOCUMENT_TYPES, type DocumentType } from "@/lib/application"
import { apiClient } from "@/lib/api-client"
import type { ApplicationDocument } from "@/types"

interface DocumentStatus {
  id: string
  type: DocumentType
  fileName: string
  uploadDate: string
  status: "uploaded" | "verified" | "rejected" | "pending"
  verificationDate?: string
  rejectionReason?: string
  fileSize: number
  fileUrl: string
}

export function DocumentManager() {
  const [documents, setDocuments] = useState<DocumentStatus[]>([])

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await apiClient.getMyApplications()
      
      if (response.success && response.data && response.data.length > 0) {
        // Get documents from the first (latest) application
        const latestApplication = response.data[0]
        
        if (latestApplication.documents) {
          const transformedDocs: DocumentStatus[] = latestApplication.documents.map((doc: ApplicationDocument) => ({
            id: doc.id,
            type: doc.type.toLowerCase().replace(/_/g, '') as DocumentType,
            fileName: doc.name || `${doc.type}.pdf`,
            uploadDate: doc.createdAt,
            status: "uploaded", // ApplicationDocument doesn't have status field, so default to uploaded
            fileSize: 0, // ApplicationDocument doesn't have fileSize field
            fileUrl: doc.url,
          }))
          setDocuments(transformedDocs)
        }
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error)
    }
  }

  const getStatusIcon = (status: DocumentStatus["status"]) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: DocumentStatus["status"]) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-600">Verified</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "pending":
        return <Badge variant="secondary">Under Review</Badge>
      default:
        return <Badge variant="outline">Uploaded</Badge>
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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

  const DocumentCard = ({ document }: { document: DocumentStatus }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{DOCUMENT_TYPES[document.type]}</CardTitle>
          {getStatusBadge(document.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span className="truncate">{document.fileName}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {getStatusIcon(document.status)}
          <span>Uploaded {formatDate(document.uploadDate)}</span>
        </div>

        <div className="text-xs text-muted-foreground">Size: {formatFileSize(document.fileSize)}</div>

        {document.status === "verified" && document.verificationDate && (
          <div className="text-xs text-green-600">Verified on {formatDate(document.verificationDate)}</div>
        )}

        {document.status === "rejected" && document.rejectionReason && (
          <Alert className="border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">{document.rejectionReason}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(document.fileUrl, '_blank')}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const link = window.document.createElement('a')
              link.href = document.fileUrl
              link.download = document.fileName
              link.click()
            }}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          {document.status === "rejected" && (
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Re-upload
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const verifiedDocs = documents.filter((doc) => doc.status === "verified")
  const pendingDocs = documents.filter((doc) => doc.status === "pending")
  const rejectedDocs = documents.filter((doc) => doc.status === "rejected")

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{verifiedDocs.length}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{pendingDocs.length}</p>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{rejectedDocs.length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
                <p className="text-sm text-muted-foreground">Total Uploaded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="pending">Under Review</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifiedDocs.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingDocs.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectedDocs.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
          {rejectedDocs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <p>No rejected documents. Great job!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
