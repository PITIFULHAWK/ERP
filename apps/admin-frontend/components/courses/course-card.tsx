import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { GraduationCap, Users, Calendar, DollarSign, Eye } from "lucide-react"
import Link from "next/link"
import type { Course } from "@/types/course"

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  const enrollmentPercentage = course.maxStudents
    ? (course.currentStudents / course.maxStudents) * 100
    : (course.currentStudents / 100) * 100

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-playfair">{course.name}</CardTitle>
              <CardDescription>{course.code}</CardDescription>
            </div>
          </div>
          <Badge variant="outline">{course.credits} Credits</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-chart-1" />
            <div>
              <p className="text-sm font-medium">{course.currentStudents}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-chart-2" />
            <div>
              <p className="text-sm font-medium">{course.totalSemester}</p>
              <p className="text-xs text-muted-foreground">Semesters</p>
            </div>
          </div>
        </div>

        {/* Enrollment Progress */}
        {course.maxStudents && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Enrollment</span>
              <span>
                {course.currentStudents}/{course.maxStudents}
              </span>
            </div>
            <Progress value={enrollmentPercentage} className="h-2" />
          </div>
        )}

        {/* Fees */}
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-chart-3" />
          <div>
            <p className="text-sm font-medium">{formatCurrency(course.totalFees)}</p>
            <p className="text-xs text-muted-foreground">Total Fees</p>
          </div>
        </div>

        {/* University */}
        <div>
          <p className="text-xs text-muted-foreground">University</p>
          <p className="text-sm font-medium">{course.university.name}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" asChild className="w-full bg-transparent">
            <Link href={`/admin/courses/${course.id}`}>
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
