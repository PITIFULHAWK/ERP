"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { format } from "date-fns"
import { Plus, Upload, Download, Trash2, Calendar, FileText, Eye } from "lucide-react"

interface Section {
  id: string
  name: string
  course: {
    id: string
    name: string
  }
  semester: {
    id: string
    code: string
  }
}

interface AcademicYear {
  id: string
  year: string
  startDate: string
  endDate: string
  isActive: boolean
}

interface TimetableData {
  id: string
  section: Section
  academicYear?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  uploadedBy: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export function TimetableManagement() {
  const [timetables, setTimetables] = useState<TimetableData[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  
  // Form state
  const [selectedSectionId, setSelectedSectionId] = useState("")
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    loadTimetables()
    loadSections()
    loadAcademicYears()
  }, [])

  const loadTimetables = async () => {
    try {
      const response = await apiClient.getAllTimetables() as { success: boolean; data: TimetableData[] }
      if (response.success) {
        setTimetables(response.data)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load timetables",
        variant: "destructive",
      })
    }
  }

  const loadSections = async () => {
    try {
      const response = await apiClient.getSections() as { success: boolean; data: Section[] }
      if (response.success) {
        setSections(response.data)
      }
    } catch {
      toast({
        title: "Error", 
        description: "Failed to load sections",
        variant: "destructive",
      })
    }
  }

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

  const handleUploadTimetable = async () => {
    if (!selectedSectionId || !selectedFile) {
      toast({
        title: "Error",
        description: "Please select a section and upload a timetable file",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.uploadTimetable(
        selectedSectionId,
        selectedFile,
        selectedAcademicYearId,
        description
      ) as { success: boolean; message: string }

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Timetable uploaded successfully",
        })
        setShowUploadDialog(false)
        resetForm()
        loadTimetables()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to upload timetable",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTimetable = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this timetable?")) return

    setLoading(true)
    try {
      const response = await apiClient.deleteTimetable(sectionId) as { success: boolean; message: string }
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Timetable deleted successfully",
        })
        loadTimetables()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete timetable",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTimetable = (timetable: TimetableData) => {
    if (timetable.fileUrl) {
      const link = document.createElement('a')
      link.href = timetable.fileUrl
      link.download = timetable.fileName || `Timetable-${timetable.section.name}.pdf`
      link.target = '_blank'
      link.click()
    }
  }

  const handleViewTimetable = (timetable: TimetableData) => {
    if (timetable.fileUrl) {
      window.open(timetable.fileUrl, '_blank')
    }
  }

  const resetForm = () => {
    setSelectedSectionId("")
    setSelectedAcademicYearId("")
    setDescription("")
    setSelectedFile(null)
  }

  const openUploadDialog = () => {
    resetForm()
    setShowUploadDialog(true)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown"
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const getSelectedSection = () => {
    return sections.find(section => section.id === selectedSectionId)
  }

  const getSectionTimetable = (sectionId: string) => {
    return timetables.find(timetable => timetable.section.id === sectionId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Timetable Management</h2>
          <p className="text-muted-foreground">
            Upload and manage section timetables
          </p>
        </div>
        <Button onClick={openUploadDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Upload Timetable
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Section Timetables
          </CardTitle>
          <CardDescription>
            Manage timetable files for different sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Timetable File</TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => {
                  const timetable = getSectionTimetable(section.id)
                  return (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">{section.name}</TableCell>
                      <TableCell>{section.course.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {section.semester.code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {timetable?.fileUrl ? (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-500" />
                            <div className="text-sm">
                              <div className="font-medium">{timetable.fileName}</div>
                              <div className="text-muted-foreground">File Available</div>
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            No File
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {timetable?.fileSize ? formatFileSize(timetable.fileSize) : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {timetable?.uploadedBy.name || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {timetable?.createdAt 
                          ? format(new Date(timetable.createdAt), "MMM dd, yyyy")
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!timetable ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSectionId(section.id)
                                setShowUploadDialog(true)
                              }}
                              className="flex items-center gap-1"
                            >
                              <Upload className="h-3 w-3" />
                              Upload
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadTimetable(timetable)}
                                className="flex items-center gap-1"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewTimetable(timetable)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedSectionId(section.id)
                                  setShowUploadDialog(true)
                                }}
                                className="flex items-center gap-1"
                              >
                                <Upload className="h-3 w-3" />
                                Replace
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteTimetable(section.id)}
                                className="flex items-center gap-1 text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Upload Timetable Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Timetable</DialogTitle>
            <DialogDescription>
              Upload a timetable file for the selected section
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name} - {section.course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="academic-year">Academic Year (Optional)</Label>
              <Select value={selectedAcademicYearId} onValueChange={setSelectedAcademicYearId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.year} {year.isActive && "(Active)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of the timetable"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timetable-file">Timetable File</Label>
              <Input
                id="timetable-file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground">
                Accepted formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG. Max size: 10MB
              </p>
            </div>

            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                Selected file: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </div>
            )}

            {getSelectedSection() && (
              <div className="text-sm text-muted-foreground">
                Uploading for: {getSelectedSection()?.name} - {getSelectedSection()?.course.name}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUploadTimetable} 
              disabled={loading || !selectedSectionId || !selectedFile}
            >
              {loading ? "Uploading..." : "Upload Timetable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}