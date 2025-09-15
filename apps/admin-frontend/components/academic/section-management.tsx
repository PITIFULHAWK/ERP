"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { Plus, Users, Edit2, Trash2, UserPlus, Eye } from "lucide-react"
import type { Section, Enrollment, CreateSectionRequest, UpdateSectionRequest, CreateEnrollmentRequest } from "@/types"

export function SectionManagement() {
  const [sections, setSections] = useState<Section[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [courses, setCourses] = useState<{id: string; name: string; code: string}[]>([])
  const [users, setUsers] = useState<{id: string; firstName: string; lastName: string; email: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  
  // Form states
  const [newSection, setNewSection] = useState<CreateSectionRequest>({
    name: "",
    code: "",
    maxCapacity: 50,
    courseId: ""
  })
  const [editingSection, setEditingSection] = useState<UpdateSectionRequest>({})
  const [newEnrollment, setNewEnrollment] = useState<CreateEnrollmentRequest>({
    studentId: "",
    sectionId: "",
    courseId: "",
    currentSemester: 1
  })

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showEnrollmentSheet, setShowEnrollmentSheet] = useState(false)

  useEffect(() => {
    loadSections()
    loadCourses()
    loadUsers()
  }, [])

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

  const loadCourses = async () => {
    try {
      const response = await apiClient.getCourses() as { success: boolean; data: {id: string; name: string; code: string}[] }
      if (response.success) {
        setCourses(response.data)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      })
    }
  }

  const loadUsers = async () => {
    try {
      const response = await apiClient.getUsers({ role: "STUDENT" }) as { success: boolean; data: {id: string; firstName: string; lastName: string; email: string}[] }
      if (response.success) {
        setUsers(response.data)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    }
  }

  const loadEnrollments = async (sectionId: string) => {
    try {
      const response = await apiClient.getEnrollments({ sectionId }) as { success: boolean; data: Enrollment[] }
      if (response.success) {
        setEnrollments(response.data)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load enrollments",
        variant: "destructive",
      })
    }
  }

  const handleCreateSection = async () => {
    if (!newSection.name || !newSection.code || !newSection.courseId) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.createSection(newSection) as { success: boolean }
      if (response.success) {
        toast({
          title: "Success",
          description: "Section created successfully",
        })
        setShowCreateDialog(false)
        setNewSection({ name: "", code: "", maxCapacity: 50, courseId: "" })
        loadSections()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to create section",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSection = async () => {
    if (!selectedSection) return

    setLoading(true)
    try {
      const response = await apiClient.updateSection(selectedSection.id, editingSection) as { success: boolean }
      if (response.success) {
        toast({
          title: "Success",
          description: "Section updated successfully",
        })
        setShowEditDialog(false)
        setEditingSection({})
        setSelectedSection(null)
        loadSections()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return

    setLoading(true)
    try {
      const response = await apiClient.deleteSection(sectionId) as { success: boolean }
      if (response.success) {
        toast({
          title: "Success",
          description: "Section deleted successfully",
        })
        loadSections()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEnrollment = async () => {
    if (!newEnrollment.studentId || !newEnrollment.sectionId || !newEnrollment.courseId) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.createEnrollment(newEnrollment) as { success: boolean }
      if (response.success) {
        toast({
          title: "Success",
          description: "Student enrolled successfully",
        })
        setNewEnrollment({ studentId: "", sectionId: "", courseId: "", currentSemester: 1 })
        if (selectedSection) {
          loadEnrollments(selectedSection.id)
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to enroll student",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (section: Section) => {
    setSelectedSection(section)
    setEditingSection({
      name: section.name,
      code: section.code,
      maxCapacity: section.maxCapacity,
      isActive: section.isActive
    })
    setShowEditDialog(true)
  }

  const viewSectionDetails = (section: Section) => {
    setSelectedSection(section)
    setNewEnrollment(prev => ({ ...prev, sectionId: section.id, courseId: section.course.id }))
    loadEnrollments(section.id)
    setShowEnrollmentSheet(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Section Management</h2>
          <p className="text-muted-foreground">
            Create and manage sections for organizing students
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Section</DialogTitle>
              <DialogDescription>
                Add a new section to organize students for a course
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Section Name</Label>
                <Input
                  id="name"
                  value={newSection.name}
                  onChange={(e) => setNewSection(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Section A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Section Code</Label>
                <Input
                  id="code"
                  value={newSection.code}
                  onChange={(e) => setNewSection(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., SEC-A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select value={newSection.courseId} onValueChange={(value) => setNewSection(prev => ({ ...prev, courseId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Max Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newSection.maxCapacity}
                  onChange={(e) => setNewSection(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                  min="1"
                  max="200"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSection} disabled={loading}>
                {loading ? "Creating..." : "Create Section"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Sections
          </CardTitle>
          <CardDescription>
            Manage all sections and their enrollments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{section.name}</div>
                        <div className="text-sm text-muted-foreground">{section.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>{section.course.name}</TableCell>
                    <TableCell>
                      {section.currentCapacity}/{section.maxCapacity}
                    </TableCell>
                    <TableCell>
                      <Badge variant={section.isActive ? "default" : "secondary"}>
                        {section.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewSectionDetails(section)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(section)}
                          className="flex items-center gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSection(section.id)}
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

      {/* Edit Section Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update section information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Section Name</Label>
              <Input
                id="edit-name"
                value={editingSection.name || ""}
                onChange={(e) => setEditingSection(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code">Section Code</Label>
              <Input
                id="edit-code"
                value={editingSection.code || ""}
                onChange={(e) => setEditingSection(prev => ({ ...prev, code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Max Capacity</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={editingSection.maxCapacity || 50}
                onChange={(e) => setEditingSection(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                min="1"
                max="200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSection} disabled={loading}>
              {loading ? "Updating..." : "Update Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Details Sheet */}
      <Sheet open={showEnrollmentSheet} onOpenChange={setShowEnrollmentSheet}>
        <SheetContent className="w-[800px] sm:w-[800px]">
          <SheetHeader>
            <SheetTitle>
              {selectedSection?.name} - Enrollments
            </SheetTitle>
            <SheetDescription>
              Manage student enrollments for this section
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            {/* Add New Enrollment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Enroll Student
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Student</Label>
                    <Select value={newEnrollment.studentId} onValueChange={(value) => setNewEnrollment(prev => ({ ...prev, studentId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Semester</Label>
                    <Input
                      type="number"
                      value={newEnrollment.currentSemester}
                      onChange={(e) => setNewEnrollment(prev => ({ ...prev, currentSemester: parseInt(e.target.value) }))}
                      min="1"
                      max="20"
                    />
                  </div>
                </div>
                <Button onClick={handleCreateEnrollment} disabled={loading}>
                  {loading ? "Enrolling..." : "Enroll Student"}
                </Button>
              </CardContent>
            </Card>

            {/* Current Enrollments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Enrollments</h3>
              {enrollments.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Enrollment Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">
                            {enrollment.student.firstName} {enrollment.student.lastName}
                          </TableCell>
                          <TableCell>{enrollment.student.email}</TableCell>
                          <TableCell>{enrollment.currentSemester}</TableCell>
                          <TableCell>
                            {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={enrollment.isActive ? "default" : "secondary"}>
                              {enrollment.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No students enrolled in this section yet
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
