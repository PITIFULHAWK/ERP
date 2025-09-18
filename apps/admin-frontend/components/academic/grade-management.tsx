"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { format } from "date-fns"
import { GraduationCap, Users, BookOpen, Award, Edit, Trash2, Plus } from "lucide-react"
import type { 
    ProfessorAssignment, 
    ProfessorExam, 
    StudentForGrading, 
    CreateGradeRequest,
    ProfessorGrade 
} from "@/types"

export function GradeManagement() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<ProfessorAssignment[]>([])
  const [exams, setExams] = useState<ProfessorExam[]>([])
  const [grades, setGrades] = useState<ProfessorGrade[]>([])
  const [studentsForGrading, setStudentsForGrading] = useState<StudentForGrading[]>([])
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedExam, setSelectedExam] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [editingGrade, setEditingGrade] = useState<{
    studentId: string;
    examResultId: string;
    currentMarks?: number;
    gradeId?: string;
  } | null>(null)
  const [newMarks, setNewMarks] = useState<string>("")

  const loadAssignments = useCallback(async () => {
    if (!user?.id) return
    
    try {
      const response = await apiClient.getProfessorGrades(user.id) as {
        success: boolean;
        data: { assignments: ProfessorAssignment[]; grades: ProfessorGrade[] };
      }
      if (response.success) {
        setAssignments(response.data.assignments)
        setGrades(response.data.grades)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load professor assignments",
        variant: "destructive",
      })
    }
  }, [user?.id])

  const loadExams = useCallback(async () => {
    if (!user?.id) return

    try {
      const response = await apiClient.getProfessorExams(user.id, {
        ...(selectedSection && { sectionId: selectedSection }),
        ...(selectedSubject && { subjectId: selectedSubject }),
      }) as {
        success: boolean;
        data: { assignments: ProfessorAssignment[]; exams: ProfessorExam[] };
      }
      if (response.success) {
        setExams(response.data.exams)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load exams",
        variant: "destructive",
      })
    }
  }, [user?.id, selectedSection, selectedSubject])

  const loadStudentsForGrading = useCallback(async () => {
    if (!user?.id || !selectedSection || !selectedSubject || !selectedExam) {
      setStudentsForGrading([])
      return
    }

    try {
      const response = await apiClient.getProfessorStudentsForGrading(
        user.id,
        selectedSection,
        selectedSubject,
        selectedExam
      ) as {
        success: boolean;
        data: {
          assignment: ProfessorAssignment;
          exam: ProfessorExam;
          studentsWithGrades: StudentForGrading[];
        };
      }
      if (response.success) {
        setStudentsForGrading(response.data.studentsWithGrades)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load students for grading",
        variant: "destructive",
      })
    }
  }, [user?.id, selectedSection, selectedSubject, selectedExam])

  useEffect(() => {
    loadAssignments()
  }, [loadAssignments])

  useEffect(() => {
    loadExams()
  }, [loadExams])

  useEffect(() => {
    loadStudentsForGrading()
  }, [loadStudentsForGrading])

  const handleAddGrade = (student: StudentForGrading) => {
    setEditingGrade({
      studentId: student.student.id,
      examResultId: student.examResult?.id || "",
      currentMarks: student.currentGrade?.marksObtained,
      gradeId: student.currentGrade?.id,
    })
    setNewMarks(student.currentGrade?.marksObtained.toString() || "")
    setGradeDialogOpen(true)
  }

  const submitGrade = async () => {
    if (!editingGrade || !user?.id || !selectedSubject) return

    const marks = parseFloat(newMarks)
    if (isNaN(marks) || marks < 0) {
      toast({
        title: "Error",
        description: "Please enter valid marks",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const gradeData: CreateGradeRequest = {
        professorId: user.id,
        examResultId: editingGrade.examResultId,
        subjectId: selectedSubject,
        marksObtained: marks,
      }

      const response = await apiClient.createOrUpdateGrade(gradeData) as {
        success: boolean;
      }

      if (response.success) {
        toast({
          title: "Success",
          description: editingGrade.gradeId ? "Grade updated successfully" : "Grade added successfully",
        })
        setGradeDialogOpen(false)
        setEditingGrade(null)
        setNewMarks("")
        loadStudentsForGrading()
        loadAssignments() // Refresh grades list
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to save grade",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGrade = async (gradeId: string) => {
    if (!user?.id) return

    if (!confirm("Are you sure you want to delete this grade?")) return

    try {
      const response = await apiClient.deleteGrade(gradeId, user.id) as {
        success: boolean;
      }

      if (response.success) {
        toast({
          title: "Success",
          description: "Grade deleted successfully",
        })
        loadStudentsForGrading()
        loadAssignments()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete grade",
        variant: "destructive",
      })
    }
  }

  const getUniqueOptions = (field: keyof ProfessorAssignment['section']) => {
    return assignments
      .map(assignment => assignment.section)
      .filter((section, index, self) => 
        index === self.findIndex(s => s[field] === section[field])
      )
  }

  const getSubjectsForSection = (sectionId: string) => {
    return assignments
      .filter(assignment => assignment.sectionId === sectionId)
      .map(assignment => assignment.subject)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Grade Management</h2>
          <p className="text-muted-foreground">
            Manage grades for students in your assigned sections
          </p>
        </div>
      </div>

      <Tabs defaultValue="manage-grades" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage-grades">Manage Grades</TabsTrigger>
          <TabsTrigger value="view-grades">View All Grades</TabsTrigger>
          <TabsTrigger value="grade-stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="manage-grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Grade Students
              </CardTitle>
              <CardDescription>
                Select section, subject, and exam to grade students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {getUniqueOptions('id').map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name} ({section.code}) - {section.course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select 
                    value={selectedSubject} 
                    onValueChange={setSelectedSubject}
                    disabled={!selectedSection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSubjectsForSection(selectedSection).map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Exam</Label>
                  <Select 
                    value={selectedExam} 
                    onValueChange={setSelectedExam}
                    disabled={!selectedSubject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.name} ({exam.type}) - {format(new Date(exam.examDate), "MMM dd, yyyy")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {studentsForGrading.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Students</h3>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Current Grade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentsForGrading.map((student) => (
                          <TableRow key={student.student.id}>
                            <TableCell className="font-medium">
                              {student.student.name}
                            </TableCell>
                            <TableCell>{student.student.email}</TableCell>
                            <TableCell>
                              {student.currentGrade ? (
                                <span className="font-semibold">
                                  {student.currentGrade.marksObtained} marks
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Not graded</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {student.examResult ? (
                                <Badge 
                                  variant={
                                    student.examResult.status === "PASS" ? "default" : 
                                    student.examResult.status === "FAIL" ? "destructive" : 
                                    "secondary"
                                  }
                                >
                                  {student.examResult.status}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddGrade(student)}
                                  className="flex items-center gap-1"
                                >
                                  {student.currentGrade ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                  {student.currentGrade ? "Edit" : "Add"} Grade
                                </Button>
                                {student.currentGrade && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteGrade(student.currentGrade!.id)}
                                    className="flex items-center gap-1"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view-grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                All Grades
              </CardTitle>
              <CardDescription>
                View all grades you have assigned
              </CardDescription>
            </CardHeader>
            <CardContent>
              {grades.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Exam</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grades.map((grade) => (
                        <TableRow key={grade.id}>
                          <TableCell className="font-medium">
                            {grade.examResult.student.name}
                          </TableCell>
                          <TableCell>
                            {grade.subject.name} ({grade.subject.code})
                          </TableCell>
                          <TableCell>
                            {grade.examResult.exam.name}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {grade.marksObtained} / {grade.examResult.exam.maxMarks}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                grade.examResult.status === "PASS" ? "default" : 
                                grade.examResult.status === "FAIL" ? "destructive" : 
                                "secondary"
                              }
                            >
                              {grade.examResult.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(grade.createdAt), "MMM dd, yyyy")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No grades found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grade-stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Grade Statistics
              </CardTitle>
              <CardDescription>
                Overview of grading statistics across your sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Grades
                        </p>
                        <p className="text-2xl font-bold">{grades.length}</p>
                      </div>
                      <Award className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Sections Assigned
                        </p>
                        <p className="text-2xl font-bold">{getUniqueOptions('id').length}</p>
                      </div>
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Subjects Teaching
                        </p>
                        <p className="text-2xl font-bold">
                          {assignments.filter((assignment, index, self) => 
                            index === self.findIndex(a => a.subjectId === assignment.subjectId)
                          ).length}
                        </p>
                      </div>
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGrade?.gradeId ? "Edit Grade" : "Add Grade"}
            </DialogTitle>
            <DialogDescription>
              Enter the marks obtained by the student for this exam.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="marks">Marks Obtained</Label>
              <Input
                id="marks"
                type="number"
                placeholder="Enter marks"
                value={newMarks}
                onChange={(e) => setNewMarks(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setGradeDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={submitGrade} disabled={loading}>
                {loading ? "Saving..." : "Save Grade"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}