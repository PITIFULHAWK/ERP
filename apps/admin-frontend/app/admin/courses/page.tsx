"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseFiltersComponent } from "@/components/courses/course-filters"
import { CourseCard } from "@/components/courses/course-card"
import { Download, RefreshCw, GraduationCap } from "lucide-react"
import Link from "next/link"
import type { Course, CourseFilters } from "@/types/course"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<CourseFilters>({})

  // Mock data for demonstration
  const mockCourses: Course[] = [
    {
      id: "course-1",
      name: "Computer Science Engineering",
      code: "CSE",
      credits: 4,
      totalSemester: 8,
      totalFees: 500000,
      currentStudents: 45,
      maxStudents: 60,
      description:
        "Comprehensive computer science program covering algorithms, data structures, and software engineering.",
      university: {
        id: "univ-1",
        name: "Indian Institute of Technology",
        uid: 12345,
      },
      universityId: "univ-1",
      users: [],
      applications: [],
      semesters: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "course-2",
      name: "Electrical Engineering",
      code: "EE",
      credits: 4,
      totalSemester: 8,
      totalFees: 480000,
      currentStudents: 38,
      maxStudents: 50,
      description: "Electrical engineering program focusing on power systems, electronics, and control systems.",
      university: {
        id: "univ-1",
        name: "Indian Institute of Technology",
        uid: 12345,
      },
      universityId: "univ-1",
      users: [],
      applications: [],
      semesters: [],
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
    },
    {
      id: "course-3",
      name: "Business Administration",
      code: "BBA",
      credits: 3,
      totalSemester: 6,
      totalFees: 300000,
      currentStudents: 72,
      maxStudents: 80,
      description: "Business administration program covering management, finance, and marketing.",
      university: {
        id: "univ-2",
        name: "Delhi University",
        uid: 67890,
      },
      universityId: "univ-2",
      users: [],
      applications: [],
      semesters: [],
      createdAt: "2024-01-03T00:00:00Z",
      updatedAt: "2024-01-03T00:00:00Z",
    },
  ]

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        // In a real app: const response = await apiClient.getCourses(filters)
        setTimeout(() => {
          setCourses(mockCourses)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch courses:", error)
        setLoading(false)
      }
    }

    fetchCourses()
  }, [filters])

  const handleExport = () => {
    console.log("Exporting courses...")
  }

  const clearFilters = () => {
    setFilters({})
  }

  const filteredCourses = courses.filter((course) => {
    if (filters.universityId && course.universityId !== filters.universityId) return false
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const name = course.name.toLowerCase()
      const code = course.code.toLowerCase()
      if (!name.includes(searchTerm) && !code.includes(searchTerm)) {
        return false
      }
    }
    return true
  })

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
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
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

      {/* Filters */}
      <CourseFiltersComponent filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} />

      {/* Courses Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-playfair font-semibold">Courses ({filteredCourses.length})</h2>
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading courses...
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.universityId
                  ? "No courses match your search criteria."
                  : "No courses have been added yet."}
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
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
