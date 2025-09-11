"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreateCourseForm } from "@/components/courses/create-course-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { CreateCourseRequest } from "@/types/course"
import { apiClient } from "@/lib/api-client"

export default function CreateCoursePage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCreateCourse = async (data: CreateCourseRequest) => {
    try {
      setIsLoading(true)
      await apiClient.createCourse(data)

      // Redirect to courses list
      router.push("/admin/courses")
    } catch (error) {
      console.error("Failed to create course:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-playfair font-bold">Create Course</h1>
          <p className="text-muted-foreground">Add a new course to the university curriculum</p>
        </div>
      </div>

      {/* Form */}
      <CreateCourseForm onSubmit={handleCreateCourse} isLoading={isLoading} />
    </div>
  )
}
