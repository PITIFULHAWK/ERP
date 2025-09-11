"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SemesterManagement } from "@/components/academic/semester-management"
import { BookOpen, Calendar, FileText, Award, RefreshCw } from "lucide-react"
import type { Semester } from "@/types/course"
import { apiClient } from "@/lib/api-client"

interface Subject {
  id: string
  name: string
  code: string
  credits: number
  semester?: { number: number }
}

interface Exam {
  id: string
  name: string
  type: string
  maxMarks: number
  examDate: string
}

interface Course {
  id: string
  name: string
}

export default function AcademicPage() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all")
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const loadData = async () => {
    try {
      // Fetch all academic data in parallel
      const [semestersResponse, subjectsResponse, examsResponse, coursesResponse] = await Promise.all([
        apiClient.getSemesters().catch(() => ({ success: true, data: [] })),
        apiClient.getSubjects().catch(() => ({ success: true, data: [] })),
        apiClient.getExams().catch(() => ({ success: true, data: [] })),
        apiClient.getCourses().catch(() => ({ success: true, data: [] }))
      ])

      // Extract data from responses with proper typing
      interface ApiResponse<T> {
        success: boolean
        data: T[]
      }

      const semestersData = Array.isArray((semestersResponse as ApiResponse<Semester>)?.data) ? (semestersResponse as ApiResponse<Semester>).data : (Array.isArray(semestersResponse) ? semestersResponse : [])
      const subjectsData = Array.isArray((subjectsResponse as ApiResponse<Subject>)?.data) ? (subjectsResponse as ApiResponse<Subject>).data : (Array.isArray(subjectsResponse) ? subjectsResponse : [])
      const examsData = Array.isArray((examsResponse as ApiResponse<Exam>)?.data) ? (examsResponse as ApiResponse<Exam>).data : (Array.isArray(examsResponse) ? examsResponse : [])
      const coursesData = Array.isArray((coursesResponse as ApiResponse<Course>)?.data) ? (coursesResponse as ApiResponse<Course>).data : (Array.isArray(coursesResponse) ? coursesResponse : [])

      setSemesters(semestersData)
      setSubjects(subjectsData)
      setExams(examsData)
      setCourses(coursesData)

      // Set default course selection if none selected
      if (selectedCourseId === "all" && coursesData.length > 0) {
        setSelectedCourseId(coursesData[0].id)
      }

    } catch (e) {
      console.error("Failed to load academic data", e)
    } finally {
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
  }

  useEffect(() => {
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter semesters by selected course
  const filteredSemesters = selectedCourseId === "all" 
    ? semesters 
    : semesters.filter(sem => sem.courseId === selectedCourseId)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold">Academic Management</h1>
          <p className="text-muted-foreground">Manage semesters, subjects, exams, and academic records</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Course" />
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
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedCourseId === "all" ? "Total Semesters" : "Course Semesters"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 text-chart-1 mr-2" />
              <div className="text-2xl font-bold">{filteredSemesters.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="w-4 h-4 text-chart-2 mr-2" />
              <div className="text-2xl font-bold">{subjects.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-chart-3 mr-2" />
              <div className="text-2xl font-bold">{exams.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Award className="w-4 h-4 text-chart-4 mr-2" />
              <div className="text-2xl font-bold">{courses.length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Management Tabs */}
      <Tabs defaultValue="semesters" className="space-y-4">
        <TabsList>
          <TabsTrigger value="semesters">Semesters</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="semesters">
          <SemesterManagement
            selectedCourseId={selectedCourseId}
            courses={courses}
            semesters={filteredSemesters}
          />
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair">Subject Management</CardTitle>
              <CardDescription>Manage subjects for each semester</CardDescription>
            </CardHeader>
            <CardContent>
              {subjects.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Showing {subjects.length} subjects across all semesters
                  </div>
                  <div className="grid gap-4">
                    {subjects.slice(0, 10).map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{subject.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Code: {subject.code} • Credits: {subject.credits}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Semester {subject.semester?.number || 'N/A'}
                        </div>
                      </div>
                    ))}
                    {subjects.length > 10 && (
                      <div className="text-center text-sm text-muted-foreground py-4">
                        And {subjects.length - 10} more subjects...
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Subjects Found</h3>
                  <p className="text-muted-foreground">No subjects have been created yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair">Exam Management</CardTitle>
              <CardDescription>Schedule and manage examinations</CardDescription>
            </CardHeader>
            <CardContent>
              {exams.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Showing {exams.length} scheduled exams
                  </div>
                  <div className="grid gap-4">
                    {exams.slice(0, 10).map((exam) => (
                      <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{exam.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Type: {exam.type} • Max Marks: {exam.maxMarks}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(exam.examDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {exams.length > 10 && (
                      <div className="text-center text-sm text-muted-foreground py-4">
                        And {exams.length - 10} more exams...
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Exams Scheduled</h3>
                  <p className="text-muted-foreground">No exams have been scheduled yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair">Grade Management</CardTitle>
              <CardDescription>Process and manage student grades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Grade Management</h3>
                <p className="text-muted-foreground">
                  Grade processing and management features will be available here.
                </p>
                <div className="mt-4 text-sm text-muted-foreground">
                  This feature will allow you to:
                  <ul className="mt-2 space-y-1 text-left max-w-md mx-auto">
                    <li>• Process exam results</li>
                    <li>• Calculate final grades</li>
                    <li>• Generate grade reports</li>
                    <li>• Manage grade appeals</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
