"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { format } from "date-fns"
import { Upload, Download, Trash2, Calendar, FileText, Eye } from "lucide-react"

interface AcademicYear {
  id: string
  year: string
  startDate: string
  endDate: string
  isActive: boolean
  universityId: string
  calendarPdfUrl?: string
  calendarPdfName?: string
  calendarUploadedAt?: string
  university: {
    id: string
    name: string
  }
}

export function AcademicCalendarManagement() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  useEffect(() => {
    loadAcademicYears()
  }, [])

  const loadAcademicYears = async () => {
    try {
      const response = await apiClient.getAcademicYears() as { success: boolean; data: AcademicYear[] }
      if (response.success) {
        setAcademicYears(response.data)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load academic years",
        variant: "destructive",
      })
    }
  }

  const handleUploadPDF = async () => {
    if (!selectedAcademicYear || !selectedFile) {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('academicYearId', selectedAcademicYear.id)

      const response = await apiClient.request('/academic-calendar/upload', {
        method: 'POST',
        body: formData,
        isFormData: true,
      }) as { success: boolean }

      if (response.success) {
        toast({
          title: "Success",
          description: "Academic calendar PDF uploaded successfully",
        })
        setShowUploadDialog(false)
        setSelectedFile(null)
        setSelectedAcademicYear(null)
        loadAcademicYears()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to upload PDF",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCalendar = async (academicYear: AcademicYear) => {
    if (!confirm("Are you sure you want to remove this academic calendar PDF?")) return

    setLoading(true)
    try {
      const response = await apiClient.request(`/academic-calendar/${academicYear.id}`, {
        method: 'DELETE',
      }) as { success: boolean }
      if (response.success) {
        toast({
          title: "Success",
          description: "Academic calendar PDF removed successfully",
        })
        loadAcademicYears()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to remove calendar PDF",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCalendar = (academicYear: AcademicYear) => {
    if (academicYear.calendarPdfUrl) {
      const link = document.createElement('a')
      link.href = academicYear.calendarPdfUrl
      link.download = academicYear.calendarPdfName || `Academic-Calendar-${academicYear.year}.pdf`
      link.target = '_blank'
      link.click()
    }
  }

  const openUploadDialog = (academicYear: AcademicYear) => {
    setSelectedAcademicYear(academicYear)
    setShowUploadDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Academic Calendar Management</h2>
          <p className="text-muted-foreground">
            Upload and manage academic calendar PDFs for different academic years
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Academic Years & Calendars
          </CardTitle>
          <CardDescription>
            Manage academic calendar PDFs for each academic year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Calendar PDF</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {academicYears.map((academicYear) => (
                  <TableRow key={academicYear.id}>
                    <TableCell className="font-medium">{academicYear.year}</TableCell>
                    <TableCell>{academicYear.university.name}</TableCell>
                    <TableCell className="text-sm">
                      <div>
                        {format(new Date(academicYear.startDate), "MMM dd, yyyy")} - 
                      </div>
                      <div>
                        {format(new Date(academicYear.endDate), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {academicYear.calendarPdfUrl ? (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-500" />
                          <div className="text-sm">
                            <div className="font-medium">{academicYear.calendarPdfName}</div>
                            <div className="text-muted-foreground">PDF Available</div>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          No PDF
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {academicYear.calendarUploadedAt 
                        ? format(new Date(academicYear.calendarUploadedAt), "MMM dd, yyyy")
                        : "-"
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={academicYear.isActive ? "default" : "secondary"}>
                        {academicYear.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!academicYear.calendarPdfUrl ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUploadDialog(academicYear)}
                            className="flex items-center gap-1"
                          >
                            <Upload className="h-3 w-3" />
                            Upload PDF
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadCalendar(academicYear)}
                              className="flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(academicYear.calendarPdfUrl, '_blank')}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveCalendar(academicYear)}
                              className="flex items-center gap-1 text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Upload PDF Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Academic Calendar PDF</DialogTitle>
            <DialogDescription>
              Upload a PDF file for {selectedAcademicYear?.year} academic calendar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="pdf-file" className="text-sm font-medium">PDF File</label>
              <Input
                id="pdf-file"
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground">
                Only PDF files are allowed. Maximum size: 15MB
              </p>
            </div>
            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadPDF} disabled={loading || !selectedFile}>
              {loading ? "Uploading..." : "Upload PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}