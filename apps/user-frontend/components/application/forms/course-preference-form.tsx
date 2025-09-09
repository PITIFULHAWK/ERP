"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import type { Course } from "@/types"

const coursePreferenceSchema = z.object({
  preferredCourseId: z.string().min(1, "Please select a preferred course"),
  alternativeCourseId: z.string().optional(),
})

type CoursePreferenceFormData = z.infer<typeof coursePreferenceSchema>

export function CoursePreferenceForm() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [alternativeCourse, setAlternativeCourse] = useState<Course | null>(null)

  const form = useForm<CoursePreferenceFormData>({
    resolver: zodResolver(coursePreferenceSchema),
    defaultValues: {
      preferredCourseId: "",
      alternativeCourseId: "",
    },
  })

  const preferredCourseId = form.watch("preferredCourseId")
  const alternativeCourseId = form.watch("alternativeCourseId")

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiClient.getCourses()
        if (response.success && response.data) {
          setCourses(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCourses()
  }, [])

  // Auto-save on form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      // Auto-save functionality can be added here if needed
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Update selected course details
  useEffect(() => {
    const course = courses.find((c) => c.id === preferredCourseId)
    setSelectedCourse(course || null)
  }, [preferredCourseId, courses])

  useEffect(() => {
    const course = courses.find((c) => c.id === alternativeCourseId)
    setAlternativeCourse(course || null)
  }, [alternativeCourseId, courses])

  const availableAlternativeCourses = courses.filter((c) => c.id !== preferredCourseId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div>
          <FormField
            control={form.control}
            name="preferredCourseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Course *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred course" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{course.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Choose the course you are most interested in pursuing</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedCourse && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">{selectedCourse.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p className="text-muted-foreground">{selectedCourse.duration} months</p>
                  </div>
                  <div>
                    <span className="font-medium">Total Fees:</span>
                    <p className="text-muted-foreground">₹{selectedCourse.totalFees}</p>
                  </div>
                  <div>
                    <span className="font-medium">University:</span>
                    <p className="text-muted-foreground">{selectedCourse.university.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Course Code:</span>
                    <p className="text-muted-foreground">{selectedCourse.code}</p>
                  </div>
                  {selectedCourse.description && (
                    <div className="col-span-2">
                      <span className="font-medium">Description:</span>
                      <p className="text-muted-foreground">{selectedCourse.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <FormField
            control={form.control}
            name="alternativeCourseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternative Course (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an alternative course" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableAlternativeCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{course.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Choose a backup course in case your preferred course is not available</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {alternativeCourse && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {alternativeCourse.name}
                  <Badge variant="outline">Alternative</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p className="text-muted-foreground">{alternativeCourse.duration} months</p>
                  </div>
                  <div>
                    <span className="font-medium">Total Fees:</span>
                    <p className="text-muted-foreground">₹{alternativeCourse.totalFees}</p>
                  </div>
                  <div>
                    <span className="font-medium">University:</span>
                    <p className="text-muted-foreground">{alternativeCourse.university.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Course Code:</span>
                    <p className="text-muted-foreground">{alternativeCourse.code}</p>
                  </div>
                  {alternativeCourse.description && (
                    <div className="col-span-2">
                      <span className="font-medium">Description:</span>
                      <p className="text-muted-foreground">{alternativeCourse.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="text-sm text-muted-foreground">* Required fields</div>
      </form>
    </Form>
  )
}
