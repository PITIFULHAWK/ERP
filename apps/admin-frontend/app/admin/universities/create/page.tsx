"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreateUniversityForm } from "@/components/universities/create-university-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { CreateUniversityRequest } from "@/types/university"
import { apiClient } from "@/lib/api-client"

export default function CreateUniversityPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCreateUniversity = async (data: CreateUniversityRequest) => {
    try {
      setIsLoading(true)
      await apiClient.onboardUniversity(data as any)

      // Redirect to universities list
      router.push("/admin/universities")
    } catch (error) {
      console.error("Failed to create university:", error)
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
          <h1 className="text-3xl font-playfair font-bold">Create University</h1>
          <p className="text-muted-foreground">Add a new university with an admin user</p>
        </div>
      </div>

      {/* Form */}
      <CreateUniversityForm onSubmit={handleCreateUniversity} isLoading={isLoading} />
    </div>
  )
}
