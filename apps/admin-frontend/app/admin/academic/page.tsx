"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EnhancedSemesterManagement } from "@/components/academic/enhanced-semester-management"
import { EnhancedSubjectManagement } from "@/components/academic/enhanced-subject-management"
import { EnhancedExamManagement } from "@/components/academic/enhanced-exam-management"
import { BookOpen, FileText, Award, Calendar, RefreshCw } from "lucide-react"
import type { Semester, Subject, Exam } from "@/types/academic"
import { apiClient } from "@/lib/api-client"

interface ApiResponse {
  data?: unknown[]
}

interface Course {
  id: string
  name: string
  code: string
  totalSemester: number
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
      setRefreshing(true)
      const [semestersResponse, subjectsResponse, examsResponse, coursesResponse] = await Promise.all([
        apiClient.getSemesters().catch(() => null),
        apiClient.getSubjects().catch(() => null),
        apiClient.getExams().catch(() => null),
        apiClient.getCourses().catch(() => null)
      ])

      // Handle different response formats safely
      const extractData = (response: unknown): unknown[] => {
        if (!response) return []
        if (Array.isArray(response)) return response
        if (response && typeof response === 'object' && 'data' in response) {
          const apiResponse = response as ApiResponse
          if (Array.isArray(apiResponse.data)) {
            return apiResponse.data
          }
        }
        return []
      }

      setSemesters(extractData(semestersResponse) as Semester[])
      setSubjects(extractData(subjectsResponse) as Subject[])
      setExams(extractData(examsResponse) as Exam[])
      setCourses(extractData(coursesResponse) as Course[])
    } catch (error) {
      console.error("Failed to load academic data", error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredSemesters = selectedCourseId === "all" 
    ? semesters 
    : semesters.filter(sem => sem.courseId === selectedCourseId)

  const filteredSubjects = selectedCourseId === "all"
    ? subjects
    : subjects.filter(subject => {
        const semester = semesters.find(sem => sem.id === subject.semesterId)
        return semester?.courseId === selectedCourseId
      })

  const filteredExams = selectedCourseId === "all"
    ? exams
    : exams.filter(exam => {
        const semester = semesters.find(sem => sem.id === exam.semesterId)
        return semester?.courseId === selectedCourseId
      })

  return (
    <div className="p-6 space-y-6">
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
            onClick={loadData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Semesters</CardTitle>
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
              <div className="text-2xl font-bold">{filteredSubjects.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Award className="w-4 h-4 text-chart-3 mr-2" />
              <div className="text-2xl font-bold">{filteredExams.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-chart-4 mr-2" />
              <div className="text-2xl font-bold">{courses.length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="semesters" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="semesters">Semesters</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="semesters" className="space-y-6">
          <EnhancedSemesterManagement
            selectedCourseId={selectedCourseId}
            courses={courses}
            semesters={semesters}
            onSemesterChange={loadData}
          />
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <EnhancedSubjectManagement
            selectedCourseId={selectedCourseId}
            courses={courses}
            subjects={subjects}
            semesters={semesters}
            onSubjectChange={loadData}
          />
        </TabsContent>

        <TabsContent value="exams" className="space-y-6">
          <EnhancedExamManagement
            selectedCourseId={selectedCourseId}
            courses={courses}
            exams={exams}
            semesters={semesters}
            onExamChange={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}