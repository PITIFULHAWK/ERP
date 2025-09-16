"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { Plus, Users, Edit2, Trash2, Eye, Loader2, RefreshCw } from "lucide-react"
import type { Section, CreateSectionRequest, UpdateSectionRequest } from "@/types"

export function SectionManagement() {
  const router = useRouter()
  const [sections, setSections] = useState<Section[]>([])
  const [courses, setCourses] = useState<{id: string; name: string; code: string}[]>([])
  const [semesters, setSemesters] = useState<{id: string; code: string; number: number; courseId: string}[]>([])
  const [academicYears, setAcademicYears] = useState<{id: string; year: string; isActive: boolean}[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  
  // Form states
  const [newSection, setNewSection] = useState<CreateSectionRequest>({
    name: "",
    code: "",
    description: "",
    maxStudents: 60,
    courseId: "",
    semesterId: "",
    academicYearId: ""
  })
  const [editingSection, setEditingSection] = useState<UpdateSectionRequest>({})

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  useEffect(() => {
    const loadAllData = async () => {
      setDataLoading(true)
      try {
        await Promise.all([
          loadSections(),
          loadCourses(),
          loadSemesters(),
          loadAcademicYears()
        ])
      } catch (error) {
        console.error('Failed to load initial data:', error)
      } finally {
        setDataLoading(false)
      }
    }
    
    loadAllData()
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

  const loadSemesters = async () => {
    try {
      const response = await apiClient.getSemesters() as { success: boolean; data: {id: string; code: string; number: number; courseId: string}[] }
      if (response.success) {
        setSemesters(response.data)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load semesters",
        variant: "destructive",
      })
    }
  }

  const loadAcademicYears = async () => {
    try {
      const response = await apiClient.getAcademicYears() as { success: boolean; data: {id: string; year: string; isActive: boolean}[] }
      if (response.success) {
        setAcademicYears(response.data)
      }
    } catch (error) {
      console.error('Error loading academic years:', error)
      toast({
        title: "Error",
        description: "Failed to load academic years",
        variant: "destructive",
      })
    }
  }

  const handleCreateSection = async () => {
    if (!newSection.name || !newSection.code || !newSection.courseId || !newSection.semesterId || !newSection.academicYearId) {
      const missingFields = [];
      if (!newSection.name) missingFields.push("Section Name");
      if (!newSection.code) missingFields.push("Section Code");
      if (!newSection.courseId) missingFields.push("Course");
      if (!newSection.semesterId) missingFields.push("Semester");
      if (!newSection.academicYearId) missingFields.push("Academic Year");
      
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(", ")}`,
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
        resetNewSectionForm()
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

  const resetNewSectionForm = () => {
    setNewSection({
      name: "",
      code: "",
      description: "",
      maxStudents:60,
      courseId: "",
      semesterId: "",
      academicYearId: ""
    })
  }

  const openCreateDialog = () => {
    resetNewSectionForm()
    setShowCreateDialog(true)
  }

  const openEditDialog = (section: Section) => {
    setSelectedSection(section)
    setEditingSection({
      name: section.name,
      code: section.code,
      maxStudents: section.maxStudents,
      isActive: section.isActive
    })
    setShowEditDialog(true)
  }

  const viewSectionDetails = (section: Section) => {
    router.push(`/admin/sections/${section.id}`)
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
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          if (!open) resetNewSectionForm()
          setShowCreateDialog(open)
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Create Section
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Create New Section</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={async () => {
                    setDataLoading(true)
                    await Promise.all([loadCourses(), loadSemesters(), loadAcademicYears()])
                    setDataLoading(false)
                  }}
                  disabled={dataLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} />
                </Button>
              </DialogTitle>
              <DialogDescription>
                Create a new section by selecting a course, semester, and academic year.
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
                <Select value={newSection.courseId} onValueChange={(value) => {
                  setNewSection(prev => ({ 
                    ...prev, 
                    courseId: value,
                    semesterId: ""
                  }))
                }} disabled={dataLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={dataLoading ? "Loading courses..." : "Select course"} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select 
                  value={newSection.semesterId} 
                  onValueChange={(value) => setNewSection(prev => ({ ...prev, semesterId: value }))}
                  disabled={!newSection.courseId || dataLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!newSection.courseId ? "Select a course first" : "Select semester"} />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters
                      .filter(semester => !newSection.courseId || semester.courseId === newSection.courseId)
                      .sort((a, b) => a.number - b.number)
                      .map((semester) => (
                        <SelectItem key={semester.id} value={semester.id}>
                          {semester.code} (Semester {semester.number})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Select value={newSection.academicYearId} onValueChange={(value) => setNewSection(prev => ({ ...prev, academicYearId: value }))} disabled={dataLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={dataLoading ? "Loading academic years..." : "Select academic year"} />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears
                      .sort((a, b) => {
                        if (a.isActive && !b.isActive) return -1;
                        if (!a.isActive && b.isActive) return 1;
                        return b.year.localeCompare(a.year);
                      })
                      .map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{year.year}</span>
                            {year.isActive && (
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                Active
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={newSection.description || ""}
                  onChange={(e) => setNewSection(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the section"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Max Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newSection.maxStudents}
                  onChange={(e) => setNewSection(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
                  min="1"
                  max="200"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetNewSectionForm()
                setShowCreateDialog(false)
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreateSection} disabled={loading || dataLoading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Section"
                )}
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
                  <TableHead>Semester & Year</TableHead>
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
                    <TableCell>
                      <div>
                        <div className="font-medium">{section.course.name}</div>
                        <div className="text-sm text-muted-foreground">{section.course.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {section.semester ? `${section.semester.code} (Sem ${section.semester.number})` : 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {section.academicYear ? section.academicYear.year : 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {section.currentStudents}/{section.maxStudents}
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
                value={editingSection.maxStudents || 60}
                onChange={(e) => setEditingSection(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
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
    </div>
  )
}