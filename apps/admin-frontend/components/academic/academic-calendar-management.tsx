"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { format } from "date-fns"
import { Plus, Upload, Download, Edit2, Trash2, Calendar, FileText, Eye } from "lucide-react"
import type { AcademicCalendar, CreateAcademicCalendarRequest, UpdateAcademicCalendarRequest } from "@/types"

export function AcademicCalendarManagement() {
  const [calendars, setCalendars] = useState<AcademicCalendar[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCalendar, setSelectedCalendar] = useState<AcademicCalendar | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Form states
  const [newCalendar, setNewCalendar] = useState<CreateAcademicCalendarRequest>({
    academicYear: "",
    title: "",
    description: "",
  })
  const [editingCalendar, setEditingCalendar] = useState<UpdateAcademicCalendarRequest>({})

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  useEffect(() => {
    loadCalendars()
  }, [])

  const loadCalendars = async () => {
    try {
      const response = await apiClient.getAcademicCalendars() as { success: boolean; data: AcademicCalendar[] }
      if (response.success) {
        setCalendars(response.data)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load academic calendars",
        variant: "destructive",
      })
    }
  }

  const handleCreateCalendar = async () => {
    if (!newCalendar.academicYear || !newCalendar.title) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.createAcademicCalendar(newCalendar) as { success: boolean }
      if (response.success) {
        toast({
          title: "Success",
          description: "Academic calendar created successfully",
        })
        setShowCreateDialog(false)
        setNewCalendar({ academicYear: "", title: "", description: "" })
        loadCalendars()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to create academic calendar",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCalendar = async () => {
    if (!selectedCalendar) return

    setLoading(true)
    try {
      const response = await apiClient.updateAcademicCalendar(selectedCalendar.id, editingCalendar) as { success: boolean }
      if (response.success) {
        toast({
          title: "Success",
          description: "Academic calendar updated successfully",
        })
        setShowEditDialog(false)
        setEditingCalendar({})
        setSelectedCalendar(null)
        loadCalendars()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update academic calendar",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUploadPDF = async () => {
    if (!selectedCalendar || !selectedFile) {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.uploadAcademicCalendarPDF(selectedCalendar.id, selectedFile) as { success: boolean }
      if (response.success) {
        toast({
          title: "Success",
          description: "PDF uploaded successfully",
        })
        setShowUploadDialog(false)
        setSelectedFile(null)
        setSelectedCalendar(null)
        loadCalendars()
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

  const handleDeleteCalendar = async (calendarId: string) => {
    if (!confirm("Are you sure you want to delete this academic calendar?")) return

    setLoading(true)
    try {
      const response = await apiClient.deleteAcademicCalendar(calendarId) as { success: boolean }
      if (response.success) {
        toast({
          title: "Success",
          description: "Academic calendar deleted successfully",
        })
        loadCalendars()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete academic calendar",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCalendar = async (calendar: AcademicCalendar) => {
    try {
      const response = await apiClient.downloadAcademicCalendar(calendar.id) as { success: boolean; data: { downloadUrl: string } }
      if (response.success) {
        // Create download link
        const link = document.createElement('a')
        link.href = response.data.downloadUrl
        link.download = calendar.fileName
        link.click()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to download calendar",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (calendar: AcademicCalendar) => {
    setSelectedCalendar(calendar)
    setEditingCalendar({
      title: calendar.title,
      description: calendar.description,
      isActive: calendar.isActive
    })
    setShowEditDialog(true)
  }

  const openUploadDialog = (calendar: AcademicCalendar) => {
    setSelectedCalendar(calendar)
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
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Calendar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Academic Calendar</DialogTitle>
              <DialogDescription>
                Add a new academic calendar entry
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  value={newCalendar.academicYear}
                  onChange={(e) => setNewCalendar(prev => ({ ...prev, academicYear: e.target.value }))}
                  placeholder="e.g., 2024-25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newCalendar.title}
                  onChange={(e) => setNewCalendar(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Academic Calendar 2024-25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCalendar.description || ""}
                  onChange={(e) => setNewCalendar(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCalendar} disabled={loading}>
                {loading ? "Creating..." : "Create Calendar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Academic Calendars
          </CardTitle>
          <CardDescription>
            Manage academic calendar PDFs for different academic years
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>PDF Status</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calendars.map((calendar) => (
                  <TableRow key={calendar.id}>
                    <TableCell className="font-medium">{calendar.academicYear}</TableCell>
                    <TableCell>{calendar.title}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="line-clamp-2 text-sm text-muted-foreground">
                        {calendar.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {calendar.fileUrl ? (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-500" />
                          <div className="text-sm">
                            <div className="font-medium">{calendar.fileName}</div>
                            <div className="text-muted-foreground">
                              {(calendar.fileSize / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          No PDF
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{calendar.uploadedBy.firstName} {calendar.uploadedBy.lastName}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(calendar.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={calendar.isActive ? "default" : "secondary"}>
                        {calendar.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!calendar.fileUrl ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUploadDialog(calendar)}
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
                              onClick={() => handleDownloadCalendar(calendar)}
                              className="flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(calendar.fileUrl, '_blank')}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(calendar)}
                          className="flex items-center gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCalendar(calendar.id)}
                          className="flex items-center gap-1 text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Calendar Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Academic Calendar</DialogTitle>
            <DialogDescription>
              Update calendar information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editingCalendar.title || ""}
                onChange={(e) => setEditingCalendar(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editingCalendar.description || ""}
                onChange={(e) => setEditingCalendar(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={editingCalendar.isActive ?? true}
                onChange={(e) => setEditingCalendar(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
                title="Active status"
                aria-label="Active status"
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCalendar} disabled={loading}>
              {loading ? "Updating..." : "Update Calendar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload PDF Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Academic Calendar PDF</DialogTitle>
            <DialogDescription>
              Upload a PDF file for {selectedCalendar?.academicYear} academic calendar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pdf-file">PDF File</Label>
              <Input
                id="pdf-file"
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground">
                Only PDF files are allowed. Maximum size: 50MB
              </p>
            </div>
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