"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { BookOpen, Plus, Edit2, Trash2, Search, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Semester } from "@/types/academic"
import type { CreateSemesterRequest, UpdateSemesterRequest } from "@/types/api"

interface Course {
  id: string
  name: string
  code: string
  totalSemester: number
}

interface SemesterManagementProps {
  selectedCourseId: string
  courses: Course[]
  semesters: Semester[]
  onSemesterChange: () => void
}

export function EnhancedSemesterManagement({
  selectedCourseId,
  courses,
  semesters,
  onSemesterChange,
}: SemesterManagementProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCourse, setFilterCourse] = useState<string>("all")

  const [formData, setFormData] = useState<CreateSemesterRequest>({
    code: "",
    number: 1,
    courseId: "",
  })

  const selectedCourse = courses.find(course => course.id === selectedCourseId)
  const isAllCoursesSelected = selectedCourseId === "all"

  // Filter semesters based on search and course filter
  const filteredSemesters = semesters.filter(semester => {
    const matchesSearch = semester.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         semester.course.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = filterCourse === "all" || semester.courseId === filterCourse
    const matchesSelectedCourse = isAllCoursesSelected || semester.courseId === selectedCourseId
    
    return matchesSearch && matchesCourse && matchesSelectedCourse
  })

  useEffect(() => {
    if (selectedCourseId !== "all") {
      setFilterCourse(selectedCourseId)
    }
  }, [selectedCourseId])

  const resetForm = () => {
    setFormData({
      code: "",
      number: 1,
      courseId: selectedCourseId !== "all" ? selectedCourseId : "",
    })
  }

  const handleCreate = async () => {
    if (!formData.code || !formData.courseId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await apiClient.createSemester(formData)
      toast({
        title: "Success",
        description: "Semester created successfully",
      })
      setCreateDialogOpen(false)
      resetForm()
      onSemesterChange()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create semester",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editingSemester) return

    setLoading(true)
    try {
      const updateData: UpdateSemesterRequest = {
        code: formData.code,
        number: formData.number,
      }
      await apiClient.updateSemester(editingSemester.id, updateData)
      toast({
        title: "Success",
        description: "Semester updated successfully",
      })
      setEditDialogOpen(false)
      setEditingSemester(null)
      resetForm()
      onSemesterChange()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update semester",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (semester: Semester) => {
    setLoading(true)
    try {
      await apiClient.deleteSemester(semester.id)
      toast({
        title: "Success",
        description: "Semester deleted successfully",
      })
      onSemesterChange()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete semester",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (semester: Semester) => {
    setEditingSemester(semester)
    setFormData({
      code: semester.code,
      number: semester.number,
      courseId: semester.courseId,
    })
    setEditDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-playfair">Semester Management</CardTitle>
            <CardDescription>
              {isAllCoursesSelected 
                ? "Manage semesters across all courses"
                : `Manage semesters for ${selectedCourse?.name || 'selected course'}`
              }
            </CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Semester
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Semester</DialogTitle>
                <DialogDescription>
                  Add a new semester to the academic system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">Semester Code</Label>
                  <Input
                    id="code"
                    placeholder="e.g., SEM1, S1, etc."
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="number">Semester Number</Label>
                  <Input
                    id="number"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Select
                    value={formData.courseId}
                    onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={loading}>
                  {loading ? "Creating..." : "Create Semester"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search semesters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {isAllCoursesSelected && (
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {filteredSemesters.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Semesters Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No semesters match your search criteria." : "No semesters have been created yet."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Semester
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Semester Number</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Exams</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSemesters.map((semester) => (
                  <TableRow key={semester.id}>
                    <TableCell className="font-medium">{semester.code}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Semester {semester.number}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{semester.course.name}</div>
                        <div className="text-sm text-muted-foreground">{semester.course.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{semester.subjects?.length || 0} subjects</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{semester.exams?.length || 0} exams</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(semester.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(semester)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the semester &ldquo;{semester.code}&rdquo; and all associated data. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(semester)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Semester</DialogTitle>
              <DialogDescription>
                Update semester information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-code">Semester Code</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-number">Semester Number</Label>
                <Input
                  id="edit-number"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={loading}>
                {loading ? "Updating..." : "Update Semester"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}