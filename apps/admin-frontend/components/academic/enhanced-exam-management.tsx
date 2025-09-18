"use client"

import { useState } from "react"
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
import { ClipboardCheck, Plus, Edit2, Trash2, Search, MoreHorizontal, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Exam, Semester } from "@/types/academic"
import type { CreateExamRequest, UpdateExamRequest } from "@/types/api"

interface Course {
  id: string
  name: string
  code: string
}

interface ExamManagementProps {
  selectedCourseId: string
  courses: Course[]
  exams: Exam[]
  semesters: Semester[]
  onExamChange: () => void
}

const examTypes = [
  { value: "FINAL_EXAM", label: "Final Exam" }
] as const

export function EnhancedExamManagement({
  selectedCourseId,
  courses,
  exams,
  semesters,
  onExamChange,
}: ExamManagementProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterSemester, setFilterSemester] = useState<string>("all")

  const [formData, setFormData] = useState<CreateExamRequest>({
    name: "",
    type: "FINAL_EXAM",
    examDate: "",
    maxMarks: 100,
    semesterId: "",
  })

  const selectedCourse = courses.find(course => course.id === selectedCourseId)
  const isAllCoursesSelected = selectedCourseId === "all"

  // Filter semesters based on selected course
  const availableSemesters = isAllCoursesSelected 
    ? semesters 
    : semesters.filter(sem => sem.courseId === selectedCourseId)

  // Filter exams based on search, type, semester, and course
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || exam.type === filterType
    const matchesSemester = filterSemester === "all" || exam.semesterId === filterSemester
    const matchesSelectedCourse = isAllCoursesSelected || 
                                 availableSemesters.some(sem => sem.id === exam.semesterId)
    
    return matchesSearch && matchesType && matchesSemester && matchesSelectedCourse
  })

  const resetForm = () => {
    setFormData({
      name: "",
      type: "FINAL_EXAM",
      examDate: "",
      maxMarks: 100,
      semesterId: "",
    })
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.examDate || !formData.semesterId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await apiClient.createExam(formData)
      toast({
        title: "Success",
        description: "Exam created successfully",
      })
      setCreateDialogOpen(false)
      resetForm()
      onExamChange()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create exam",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editingExam) return

    setLoading(true)
    try {
      const updateData: UpdateExamRequest = {
        name: formData.name,
        type: formData.type,
        examDate: formData.examDate,
        maxMarks: formData.maxMarks,
      }
      await apiClient.updateExam(editingExam.id, updateData)
      toast({
        title: "Success",
        description: "Exam updated successfully",
      })
      setEditDialogOpen(false)
      setEditingExam(null)
      resetForm()
      onExamChange()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update exam",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (exam: Exam) => {
    setLoading(true)
    try {
      await apiClient.deleteExam(exam.id)
      toast({
        title: "Success",
        description: "Exam deleted successfully",
      })
      onExamChange()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete exam",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (exam: Exam) => {
    setEditingExam(exam)
    setFormData({
      name: exam.name,
      type: exam.type,
      examDate: exam.examDate.split('T')[0], // Convert to YYYY-MM-DD format
      maxMarks: exam.maxMarks,
      semesterId: exam.semesterId,
    })
    setEditDialogOpen(true)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "MID_TERM": return "bg-blue-100 text-blue-800"
      case "FINAL_EXAM": return "bg-red-100 text-red-800"
      case "QUIZ": return "bg-green-100 text-green-800"
      case "PRACTICAL": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-playfair">Exam Management</CardTitle>
            <CardDescription>
              {isAllCoursesSelected 
                ? "Manage exams across all courses"
                : `Manage exams for ${selectedCourse?.name || 'selected course'}`
              }
            </CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Exam
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
                <DialogDescription>
                  Add a new exam to a semester
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Exam Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Data Structures Mid Term, Final Exam, etc."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Exam Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value:"FINAL_EXAM") => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="examDate">Exam Date</Label>
                  <Input
                    id="examDate"
                    type="date"
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxMarks">Maximum Marks</Label>
                  <Input
                    id="maxMarks"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 100 })}
                  />
                </div>
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Select
                    value={formData.semesterId}
                    onValueChange={(value) => setFormData({ ...formData, semesterId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSemesters.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id}>
                          {semester.code} - {semester.course.name} (Semester {semester.number})
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
                  {loading ? "Creating..." : "Create Exam"}
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
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {examTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSemester} onValueChange={setFilterSemester}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {availableSemesters.map((semester) => (
                <SelectItem key={semester.id} value={semester.id}>
                  {semester.code} - {semester.course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredExams.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Exams Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No exams match your search criteria." : "No exams have been created yet."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Exam
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Max Marks</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Results</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(exam.type)}>
                        {examTypes.find(t => t.value === exam.type)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(exam.examDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{exam.maxMarks} marks</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{exam.semester.code}</div>
                        <div className="text-sm text-muted-foreground">Semester {exam.semester.number}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {exam.semester.course.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{exam.results?.length || 0} results</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(exam.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(exam)}>
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
                                  This will permanently delete the exam &ldquo;{exam.name}&rdquo; and all associated data. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(exam)}
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
              <DialogTitle>Edit Exam</DialogTitle>
              <DialogDescription>
                Update exam information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Exam Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Exam Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "FINAL_EXAM") => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    {examTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-examDate">Exam Date</Label>
                <Input
                  id="edit-examDate"
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-maxMarks">Maximum Marks</Label>
                <Input
                  id="edit-maxMarks"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 100 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={loading}>
                {loading ? "Updating..." : "Update Exam"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}