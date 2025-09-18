"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { ArrowLeft, UserPlus, Users, Loader2, RefreshCw } from "lucide-react"
import type { Section, Enrollment, CreateEnrollmentRequest } from "@/types"

export default function SectionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const sectionId = params.id as string
  
  const [section, setSection] = useState<Section | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [users, setUsers] = useState<{id: string; name: string; email: string}[]>([])
  const [professors, setProfessors] = useState<{id: string; name: string; email: string}[]>([])
  const [subjects, setSubjects] = useState<{id: string; name: string; code: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  
  // Form states
  const [newEnrollment, setNewEnrollment] = useState<CreateEnrollmentRequest>({
    studentId: "",
    sectionId: sectionId,
    courseId: "",
    currentSemester: 1
  })
  const [newProfessorAssignment, setNewProfessorAssignment] = useState({
    professorId: "",
    sectionId: sectionId,
    subjectId: "",
    assignmentType: "INSTRUCTOR" as "INSTRUCTOR" | "ASSISTANT"
  })

  useEffect(() => {
    if (sectionId) {
      loadAllData()
    }
  }, [sectionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllData = async () => {
    setDataLoading(true)
    try {
      await Promise.all([
        loadSection(), // This will also load subjects filtered by semester
        loadEnrollments(),
        loadUsers(),
        loadProfessors()
      ])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const loadSection = async () => {
    try {
      // Use getSections and filter for the specific section since getSection(id) doesn't exist
      const response = await apiClient.getSections() as { success: boolean; data: Section[] }
      if (response.success) {
        const foundSection = response.data.find(s => s.id === sectionId)
        if (foundSection) {
          setSection(foundSection)
          setNewEnrollment(prev => ({ ...prev, courseId: foundSection.course.id }))
          
          // After setting section, load subjects filtered by semester
          if (foundSection.semester?.id) {
            console.log('Loading subjects for semester:', foundSection.semester.code, '(ID:', foundSection.semester.id, ')')
            try {
              // Use getSubjects with semesterId filter instead of getSubjectsBySemester
              const subjectsResponse = await apiClient.getSubjects({ semesterId: foundSection.semester.id }) as { success: boolean; data: {id: string; name: string; code: string}[] }
              if (subjectsResponse.success) {
                console.log('Loaded', subjectsResponse.data.length, 'subjects for semester', foundSection.semester.code)
                console.log('Sample subjects:', subjectsResponse.data.slice(0, 5).map(s => `${s.name} (${s.code})`))
                setSubjects(subjectsResponse.data)
              }
            } catch (error) {
              console.error('Failed to load semester-specific subjects:', error)
              // Fallback to all subjects if semester-specific loading fails
              console.log('Fallback: Loading all subjects (no filter)')
              const allSubjectsResponse = await apiClient.getSubjects() as { success: boolean; data: {id: string; name: string; code: string}[] }
              if (allSubjectsResponse.success) {
                console.log('Fallback: Loaded', allSubjectsResponse.data.length, 'total subjects')
                setSubjects(allSubjectsResponse.data)
              }
            }
          } else {
            console.log('No semester found for section, loading all subjects')
            // Load all subjects if no semester
            const allSubjectsResponse = await apiClient.getSubjects() as { success: boolean; data: {id: string; name: string; code: string}[] }
            if (allSubjectsResponse.success) {
              setSubjects(allSubjectsResponse.data)
            }
          }
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load section details",
        variant: "destructive",
      })
    }
  }

  const loadEnrollments = async () => {
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

  const loadUsers = async () => {
    try {
      const response = await apiClient.getUsers({ role: "STUDENT" }) as { success: boolean; data: {id: string; name: string; email: string}[] }
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

  const loadProfessors = async () => {
    try {
      const response = await apiClient.getUsers({ role: "PROFESSOR" }) as { success: boolean; data: {id: string; name: string; email: string}[] }
      if (response.success) {
        setProfessors(response.data)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load professors",
        variant: "destructive",
      })
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

    console.log('Attempting to enroll student with data:', {
      studentId: newEnrollment.studentId,
      sectionId: newEnrollment.sectionId,
      courseId: newEnrollment.courseId,
      currentSemester: newEnrollment.currentSemester,
      sectionDetails: section ? {
        sectionName: section.name,
        courseName: section.course.name,
        semesterCode: section.semester?.code,
        semesterId: section.semester?.id,
        academicYear: section.academicYear?.year,
        academicYearId: section.academicYear?.id
      } : 'Section not loaded'
    })

    setLoading(true)
    try {
      // Step 1: Create comprehensive course and enrollment record
      console.log('Step 1: Creating comprehensive course and enrollment record...')
      
      // Prepare enrollment data with all necessary information
      const comprehensiveEnrollmentData = {
        studentId: newEnrollment.studentId,
        courseId: newEnrollment.courseId,
        currentSemester: newEnrollment.currentSemester,
        semesterId: section?.semester?.id,
        academicYearId: section?.academicYear?.id,
        sectionId: newEnrollment.sectionId // Include section for comprehensive enrollment
      }
      
      console.log('Enrollment data:', comprehensiveEnrollmentData)
      
      const enrollmentResponse = await apiClient.createEnrollment(comprehensiveEnrollmentData) as { success: boolean; message?: string }
      
      if (!enrollmentResponse.success) {
        console.error('Failed to create course enrollment:', enrollmentResponse)
        toast({
          title: "Error",
          description: enrollmentResponse.message || "Failed to enroll student in course",
          variant: "destructive",
        })
        return
      }
      
      console.log('Course and enrollment record created successfully')
      
      // Step 2: Assign student to specific section (if not already done in step 1)
      console.log('Step 2: Ensuring student is assigned to section...')
      const assignmentResponse = await apiClient.assignStudentToSection(
        newEnrollment.studentId, 
        newEnrollment.sectionId
      ) as { success: boolean; message?: string }
      
      if (assignmentResponse.success) {
        toast({
          title: "Success",
          description: "Student enrolled in course and assigned to section successfully",
        })
        setNewEnrollment(prev => ({ ...prev, studentId: "", currentSemester: 1 }))
        loadEnrollments()
        loadSection() // Reload to update student count
      } else {
        console.error('Section assignment failed:', assignmentResponse)
        toast({
          title: "Warning",
          description: "Student enrolled in course but section assignment may have failed: " + (assignmentResponse.message || "Unknown error"),
          variant: "destructive",
        })
        // Still reload to check if enrollment worked
        loadEnrollments()
        loadSection()
      }
    } catch (error) {
      console.error('Enrollment error:', error)
      toast({
        title: "Error",
        description: "Failed to enroll student",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignProfessor = async () => {
    if (!newProfessorAssignment.professorId || !newProfessorAssignment.sectionId || !newProfessorAssignment.subjectId) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.assignProfessorToSection(newProfessorAssignment) as { success: boolean }
      if (response.success) {
        toast({
          title: "Success",
          description: "Professor assigned successfully",
        })
        setNewProfessorAssignment(prev => ({ 
          ...prev, 
          professorId: "", 
          subjectId: "", 
          assignmentType: "INSTRUCTOR" as "INSTRUCTOR" | "ASSISTANT"
        }))
        loadSection() // Reload to get updated professor assignments
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to assign professor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading section details...</span>
        </div>
      </div>
    )
  }

  if (!section) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Section Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested section could not be found.</p>
          <Button onClick={() => router.push('/admin/sections')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sections
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/sections')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sections
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{section.name} - Management Dashboard</h1>
            <p className="text-muted-foreground">
              Manage student enrollments and professor assignments for this section
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={loadAllData}
          disabled={dataLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Section Info */}
      <Card>
        <CardHeader>
          <CardTitle>Section Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="font-semibold">Section Code</Label>
              <p>{section.code}</p>
            </div>
            <div>
              <Label className="font-semibold">Course</Label>
              <p>{section.course.name} ({section.course.code})</p>
            </div>
            <div>
              <Label className="font-semibold">Semester</Label>
              <p>{section.semester ? `${section.semester.code} (Sem ${section.semester.number})` : 'N/A'}</p>
            </div>
            <div>
              <Label className="font-semibold">Academic Year</Label>
              <p>{section.academicYear ? section.academicYear.year : 'N/A'}</p>
            </div>
            <div>
              <Label className="font-semibold">Capacity</Label>
              <p>{section.currentStudents}/{section.maxStudents}</p>
            </div>
            <div>
              <Label className="font-semibold">Status</Label>
              <Badge variant={section.isActive ? "default" : "secondary"}>
                {section.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Enrollment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Student Enrollment
            </CardTitle>
            <CardDescription>
              Add students to this section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select value={newEnrollment.studentId} onValueChange={(value) => setNewEnrollment(prev => ({ ...prev, studentId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student to enroll" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
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
                placeholder="Enter semester number"
              />
            </div>
            <Button onClick={handleCreateEnrollment} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enrolling...
                </>
              ) : (
                "Enroll Student"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Professor Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Professor Assignment
            </CardTitle>
            <CardDescription>
              Assign professors to teach subjects in this section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Professor</Label>
              <Select value={newProfessorAssignment.professorId} onValueChange={(value) => setNewProfessorAssignment(prev => ({ ...prev, professorId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a professor" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {professors.map((professor) => (
                    <SelectItem key={professor.id} value={professor.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{professor.name}</span>
                        <span className="text-xs text-muted-foreground">{professor.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              {section?.semester && (
                <p className="text-xs text-muted-foreground">
                  Showing subjects for {section.semester.code} (Semester {section.semester.number})
                </p>
              )}
              <Select value={newProfessorAssignment.subjectId} onValueChange={(value) => setNewProfessorAssignment(prev => ({ ...prev, subjectId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={subjects.length > 0 ? "Select subject" : "Loading subjects..."} />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{subject.name}</span>
                          <span className="text-xs text-muted-foreground">{subject.code}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      {section?.semester ? 
                        `No subjects found for ${section.semester.code}` : 
                        "Loading subjects..."
                      }
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assignment Role</Label>
              <Select value={newProfessorAssignment.assignmentType} onValueChange={(value) => setNewProfessorAssignment(prev => ({ ...prev, assignmentType: value as "INSTRUCTOR" | "ASSISTANT" }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INSTRUCTOR">Primary Instructor</SelectItem>
                  <SelectItem value="ASSISTANT">Teaching Assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssignProfessor} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Assigning...
                </>
              ) : (
                "Assign Professor"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Current Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Student Enrollments
            </span>
            <Badge variant="outline">
              {enrollments.length} Students
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                        {enrollment.student.name}
                      </TableCell>
                      <TableCell>{enrollment.student.email}</TableCell>
                      <TableCell>Semester {enrollment.enrollment?.semester?.number || enrollment.currentSemester}</TableCell>
                      <TableCell>
                        {new Date(enrollment.createdAt || enrollment.enrollmentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={enrollment.status === "ACTIVE" ? "default" : "secondary"}>
                          {enrollment.status === "ACTIVE" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No students enrolled yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professor Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Assigned Professors
            </span>
            <Badge variant="outline">
              {section.professorAssignments?.filter(assignment => assignment.isActive).length || 0} Professors
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {section.professorAssignments && section.professorAssignments.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Professor Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.professorAssignments
                    .filter(assignment => assignment.isActive)
                    .map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.professor.name}
                      </TableCell>
                      <TableCell>{assignment.professor.email}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{assignment.subject.name}</div>
                          <div className="text-xs text-muted-foreground">{assignment.subject.code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={assignment.assignmentType === "INSTRUCTOR" ? "default" : "outline"}>
                          {assignment.assignmentType === "INSTRUCTOR" ? "Instructor" : "Assistant"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-600">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No professors assigned yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}