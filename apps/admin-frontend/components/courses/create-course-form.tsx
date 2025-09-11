"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, GraduationCap } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import type { CreateCourseRequest } from "@/types/course"
import type { University } from "@/types/university"

interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

const createCourseSchema = z.object({
  name: z.string().min(2, "Course name must be at least 2 characters"),
  code: z.string().min(2, "Course code must be at least 2 characters"),
  credits: z.number().min(1, "Credits must be at least 1"),
  totalSemester: z.number().min(1, "Must have at least 1 semester").max(12, "Cannot exceed 12 semesters"),
  totalFees: z.number().min(0, "Fees cannot be negative"),
  maxStudents: z.number().min(1, "Must allow at least 1 student").optional(),
  description: z.string().optional(),
  universityId: z.string().min(1, "Please select a university"),
})

type CreateCourseFormData = z.infer<typeof createCourseSchema>

interface CreateCourseFormProps {
  onSubmit: (data: CreateCourseRequest) => Promise<void>
  isLoading?: boolean
}

export function CreateCourseForm({ onSubmit, isLoading = false }: CreateCourseFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [universities, setUniversities] = useState<University[]>([])
  const [loadingUniversities, setLoadingUniversities] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
  })

  const watchedUniversityId = watch("universityId")

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoadingUniversities(true)
        const response = await apiClient.getUniversities() as ApiResponse<University[]>
        if (response.success && response.data) {
          setUniversities(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch universities:", error)
        setError("Failed to load universities")
      } finally {
        setLoadingUniversities(false)
      }
    }

    fetchUniversities()
  }, [])

  const handleFormSubmit = async (data: CreateCourseFormData) => {
    try {
      setError(null)
      await onSubmit(data)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course")
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-playfair">Create New Course</CardTitle>
            <CardDescription>Add a new course to the university curriculum</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Course Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Computer Science Engineering"
                  {...register("name")}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="code">Course Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., CSE"
                  {...register("code")}
                  className={errors.code ? "border-destructive" : ""}
                />
                {errors.code && <p className="text-sm text-destructive mt-1">{errors.code.message}</p>}
              </div>
              <div>
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  placeholder="e.g., 4"
                  {...register("credits", { valueAsNumber: true })}
                  className={errors.credits ? "border-destructive" : ""}
                />
                {errors.credits && <p className="text-sm text-destructive mt-1">{errors.credits.message}</p>}
              </div>
              <div>
                <Label htmlFor="totalSemester">Total Semesters</Label>
                <Input
                  id="totalSemester"
                  type="number"
                  placeholder="e.g., 8"
                  {...register("totalSemester", { valueAsNumber: true })}
                  className={errors.totalSemester ? "border-destructive" : ""}
                />
                {errors.totalSemester && (
                  <p className="text-sm text-destructive mt-1">{errors.totalSemester.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="totalFees">Total Fees (INR)</Label>
                <Input
                  id="totalFees"
                  type="number"
                  placeholder="e.g., 500000"
                  {...register("totalFees", { valueAsNumber: true })}
                  className={errors.totalFees ? "border-destructive" : ""}
                />
                {errors.totalFees && <p className="text-sm text-destructive mt-1">{errors.totalFees.message}</p>}
              </div>
              <div>
                <Label htmlFor="maxStudents">Max Students (Optional)</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  placeholder="e.g., 60"
                  {...register("maxStudents", { valueAsNumber: true })}
                  className={errors.maxStudents ? "border-destructive" : ""}
                />
                {errors.maxStudents && <p className="text-sm text-destructive mt-1">{errors.maxStudents.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the course..."
                {...register("description")}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
          </div>

          {/* University Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">University</h3>
            <div>
              <Label htmlFor="universityId">Select University</Label>
              <Select value={watchedUniversityId} onValueChange={(value) => setValue("universityId", value)}>
                <SelectTrigger className={errors.universityId ? "border-destructive" : ""}>
                  <SelectValue placeholder={
                    loadingUniversities 
                      ? "Loading universities..." 
                      : universities.length === 0 
                        ? "No universities available" 
                        : "Choose a university"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {!loadingUniversities && universities.length > 0 && (
                    universities.map((university) => (
                      <SelectItem key={university.id} value={university.id}>
                        {university.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.universityId && <p className="text-sm text-destructive mt-1">{errors.universityId.message}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Course...
                </>
              ) : (
                "Create Course"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => reset()} disabled={isLoading}>
              Reset Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
