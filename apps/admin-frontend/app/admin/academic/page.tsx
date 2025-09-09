"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SemesterManagement } from "@/components/academic/semester-management"
import { BookOpen, Calendar, FileText, Award } from "lucide-react"
import type { Semester } from "@/types/course"

export default function AcademicPage() {
  const [semesters, setSemesters] = useState<Semester[]>([])

  // Mock data for demonstration
  const mockSemesters: Semester[] = [
    {
      id: "sem-1",
      name: "First Semester",
      number: 1,
      courseId: "course-1",
      course: {} as any,
      subjects: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "sem-2",
      name: "Second Semester",
      number: 2,
      courseId: "course-1",
      course: {} as any,
      subjects: [],
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
    },
  ]

  const handleCreateSemester = (data: { name: string; number: number }) => {
    const newSemester: Semester = {
      id: `sem-${Date.now()}`,
      name: data.name,
      number: data.number,
      courseId: "course-1",
      course: {} as any,
      subjects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSemesters([...semesters, newSemester])
  }

  const handleUpdateSemester = (id: string, data: { name: string; number: number }) => {
    setSemesters(
      semesters.map((sem) =>
        sem.id === id
          ? {
              ...sem,
              name: data.name,
              number: data.number,
              updatedAt: new Date().toISOString(),
            }
          : sem,
      ),
    )
  }

  const handleDeleteSemester = (id: string) => {
    setSemesters(semesters.filter((sem) => sem.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-playfair font-bold">Academic Management</h1>
        <p className="text-muted-foreground">Manage semesters, subjects, exams, and academic records</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Semesters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 text-chart-1 mr-2" />
              <div className="text-2xl font-bold">{semesters.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="w-4 h-4 text-chart-2 mr-2" />
              <div className="text-2xl font-bold">24</div>
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
              <div className="text-2xl font-bold">8</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Grades Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Award className="w-4 h-4 text-chart-4 mr-2" />
              <div className="text-2xl font-bold">156</div>
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
            courseId="course-1"
            semesters={mockSemesters}
            onCreateSemester={handleCreateSemester}
            onUpdateSemester={handleUpdateSemester}
            onDeleteSemester={handleDeleteSemester}
          />
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair">Subject Management</CardTitle>
              <CardDescription>Manage subjects for each semester</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Subject Management</h3>
                <p className="text-muted-foreground">Subject management features will be available here.</p>
              </div>
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
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Exam Management</h3>
                <p className="text-muted-foreground">Exam scheduling and management features will be available here.</p>
              </div>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
