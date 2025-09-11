"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseCard } from "@/components/courses/course-card"
import { RefreshCw, GraduationCap } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import type { Course } from "@/types/course"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getCourses() as { success: boolean; data: Course[] }
      if (response.success && response.data) {
        setCourses(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error)
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const totalStudents = courses.reduce((sum, course) => sum + course.currentStudents, 0)
  const totalFees = courses.reduce((sum, course) => sum + course.totalFees, 0)
  const avgEnrollment = courses.length > 0 ? Math.round(totalStudents / courses.length) : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage academic courses and curriculum</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/admin/courses/create">
              <GraduationCap className="w-4 h-4 mr-2" />
              Add Course
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{avgEnrollment}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">₹{(totalFees / 1000000).toFixed(1)}M</div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-playfair font-semibold">Courses ({courses.length})</h2>
          <Button variant="ghost" size="sm" onClick={fetchCourses} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
              <p className="text-muted-foreground mb-4">
                No courses have been added yet.
              </p>
              <Button asChild>
                <Link href="/admin/courses/create">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Add First Course
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
