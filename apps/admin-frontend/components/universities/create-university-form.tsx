"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, Building2 } from "lucide-react"
import type { CreateUniversityRequest } from "@/types/university"

const createUniversitySchema = z.object({
  name: z.string().min(2, "University name must be at least 2 characters"),
  uid: z.number().min(1, "UID must be a positive number"),
  adminName: z.string().min(2, "Admin name must be at least 2 characters"),
  adminEmail: z.string().email("Please enter a valid email address"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
})

type CreateUniversityFormData = z.infer<typeof createUniversitySchema>

interface CreateUniversityFormProps {
  onSubmit: (data: CreateUniversityRequest) => Promise<void>
  isLoading?: boolean
}

export function CreateUniversityForm({ onSubmit, isLoading = false }: CreateUniversityFormProps) {
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUniversityFormData>({
    resolver: zodResolver(createUniversitySchema),
  })

  const handleFormSubmit = async (data: CreateUniversityFormData) => {
    try {
      setError(null)
      await onSubmit(data)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create university")
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-playfair">Create New University</CardTitle>
            <CardDescription>Add a new university to the system with an admin user</CardDescription>
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

          {/* University Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">University Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">University Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Indian Institute of Technology"
                  {...register("name")}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="uid">University ID (UID)</Label>
                <Input
                  id="uid"
                  type="number"
                  placeholder="e.g., 12345"
                  {...register("uid", { valueAsNumber: true })}
                  className={errors.uid ? "border-destructive" : ""}
                />
                {errors.uid && <p className="text-sm text-destructive mt-1">{errors.uid.message}</p>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Admin User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Admin User Details</h3>
            <p className="text-sm text-muted-foreground">
              This user will be created as the primary administrator for the university.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adminName">Admin Name</Label>
                <Input
                  id="adminName"
                  placeholder="e.g., John Doe"
                  {...register("adminName")}
                  className={errors.adminName ? "border-destructive" : ""}
                />
                {errors.adminName && <p className="text-sm text-destructive mt-1">{errors.adminName.message}</p>}
              </div>
              <div>
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@university.edu"
                  {...register("adminEmail")}
                  className={errors.adminEmail ? "border-destructive" : ""}
                />
                {errors.adminEmail && <p className="text-sm text-destructive mt-1">{errors.adminEmail.message}</p>}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="adminPassword">Admin Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Enter a secure password"
                  {...register("adminPassword")}
                  className={errors.adminPassword ? "border-destructive" : ""}
                />
                {errors.adminPassword && (
                  <p className="text-sm text-destructive mt-1">{errors.adminPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating University...
                </>
              ) : (
                "Create University"
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
