"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Eye, Download, FileText } from "lucide-react"
import type { ApplicationDocument } from "@/types/application"

interface DocumentVerificationProps {
  documents: ApplicationDocument[]
  onVerifyDocument: (documentId: string, isVerified: boolean, notes?: string) => void
}

export function DocumentVerification({ documents, onVerifyDocument }: DocumentVerificationProps) {
  const [selectedDocument, setSelectedDocument] = useState<ApplicationDocument | null>(null)
  const [verificationNotes, setVerificationNotes] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CLASS_10_MARKSHEET: "Class 10 Marksheet",
      CLASS_12_MARKSHEET: "Class 12 Marksheet",
      JEE_MAINS_SCORECARD: "JEE Mains Scorecard",
      PHOTO: "Photograph",
      SIGNATURE: "Signature",
      IDENTITY_PROOF: "Identity Proof",
      ADDRESS_PROOF: "Address Proof",
      CATEGORY_CERTIFICATE: "Category Certificate",
      INCOME_CERTIFICATE: "Income Certificate",
    }
    return labels[type] || type
  }

  const handleVerify = (isVerified: boolean) => {
    if (selectedDocument) {
      onVerifyDocument(selectedDocument.id, isVerified, verificationNotes)
      setIsDialogOpen(false)
      setVerificationNotes("")
      setSelectedDocument(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((document) => (
          <Card key={document.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{getDocumentTypeLabel(document.type)}</CardTitle>
                <Badge variant={document.isVerified ? "default" : "secondary"}>
                  {document.isVerified ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <FileText className="w-3 h-3 mr-1" />
                      Pending
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <div>File: {document.fileName}</div>
                <div>Size: {formatFileSize(document.fileSize)}</div>
                <div>Type: {document.mimeType}</div>
              </div>

              {document.isVerified && document.verifiedBy && (
                <div className="text-sm text-muted-foreground">
                  <div>Verified by: {document.verifiedBy.name}</div>
                  <div>Verified on: {new Date(document.verifiedAt!).toLocaleDateString()}</div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" asChild>
                  <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={document.fileUrl} download={document.fileName}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </a>
                </Button>
                {!document.isVerified && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => setSelectedDocument(document)}>
                        Verify
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Verify Document</DialogTitle>
                        <DialogDescription>
                          Review and verify the {getDocumentTypeLabel(document.type).toLowerCase()}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="notes">Verification Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            placeholder="Add any notes about the document verification..."
                            value={verificationNotes}
                            onChange={(e) => setVerificationNotes(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => handleVerify(false)}>
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button onClick={() => handleVerify(true)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
