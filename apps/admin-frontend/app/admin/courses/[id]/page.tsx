"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  GraduationCap, 
  Users, 
  Calendar, 
  DollarSign, 
  School, 
  BookOpen,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import type { Course } from "@/types/course"

export default function CourseViewPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  const courseId = params.id as string

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getCourse(courseId) as { success: boolean; data: Course }
        if (response.success && response.data) {
          setCourse(response.data)
        } else {
          toast({
            title: "Error",
            description: "Course not found",
            variant: "destructive",
          })
          router.push("/admin/courses")
        }
      } catch (error) {
        console.error("Failed to fetch course:", error)
        toast({
          title: "Error",
          description: "Failed to load course details",
          variant: "destructive",
        })
        router.push("/admin/courses")
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId, router])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Loading course details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Course Not Found</h3>
            <p className="text-muted-foreground mb-4">The course you&apos;re looking for doesn&apos;t exist.</p>
            <Button asChild>
              <Link href="/admin/courses">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const enrollmentPercentage = course.maxStudents
    ? (course.currentStudents / course.maxStudents) * 100
    : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/courses">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-playfair font-bold">{course.name}</h1>
            <p className="text-muted-foreground">Course Code: {course.code}</p>
          </div>
        </div>
      </div>

      {/* Course Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Course Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Course Name</p>
                  <p className="text-lg font-semibold">{course.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Course Code</p>
                  <p className="text-lg font-semibold">{course.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Credits</p>
                  <Badge variant="secondary" className="text-sm">
                    {course.credits} Credits
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Semesters</p>
                  <p className="text-lg font-semibold">{course.totalSemester}</p>
                </div>
              </div>
              
              {course.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                    <p className="text-sm leading-relaxed">{course.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* University Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <School className="w-5 h-5" />
                <span>University</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{course.university.name}</p>
              <p className="text-sm text-muted-foreground">University ID: {course.university.id}</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Enrollment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{course.currentStudents}</p>
                <p className="text-sm text-muted-foreground">Current Students</p>
              </div>
              
              {course.maxStudents && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Capacity</span>
                      <span>{course.currentStudents}/{course.maxStudents}</span>
                    </div>
                    <Progress value={enrollmentPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      {enrollmentPercentage.toFixed(1)}% filled
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Financial Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Fees</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(course.totalFees)}
                </p>
                <p className="text-sm text-muted-foreground">Total Course Fees</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
