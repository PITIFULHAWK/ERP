"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BookOpen } from "lucide-react"
import type { Semester } from "@/types/course"

interface SemesterManagementProps {
  selectedCourseId: string
  courses: Array<{ id: string; name: string }>
  semesters: Semester[]
}

export function SemesterManagement({
  selectedCourseId,
  courses,
  semesters,
}: SemesterManagementProps) {
  const selectedCourse = courses.find(course => course.id === selectedCourseId)
  const isAllCoursesSelected = selectedCourseId === "all"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-playfair">Semester Management</CardTitle>
            <CardDescription>
              {isAllCoursesSelected 
                ? "View semesters across all courses"
                : `View semesters for ${selectedCourse?.name || 'selected course'}`
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {semesters.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Semesters</h3>
            <p className="text-muted-foreground mb-4">
              {isAllCoursesSelected 
                ? "No semesters found across all courses."
                : `No semesters found for ${selectedCourse?.name || 'this course'}.`
              }
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semester</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Subjects</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semesters
                .sort((a, b) => a.number - b.number)
                .map((semester) => (
                  <TableRow key={semester.id}>
                    <TableCell>
                      <div className="font-medium">{semester.code}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{semester.course?.name || 'N/A'}</span>
                        <br />
                        <span className="text-muted-foreground">{semester.course?.code || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{semester.number}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{semester.subjects?.length || 0} subjects</span>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
