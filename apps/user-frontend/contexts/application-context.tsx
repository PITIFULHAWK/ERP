"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import type { Application, CreateApplicationRequest } from "@/types"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "./auth-context"
import { toast } from "@/hooks/use-toast"

interface FormData {
  personalInfo?: {
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: "MALE" | "FEMALE" | "OTHER"
    nationality: string
    phoneNumber: string
    alternatePhoneNumber?: string
  }
  addressInfo?: {
    address: string
    city: string
    state: string
    pincode: string
  }
  academicInfo?: {
    class10Percentage: number
    class10Board: string
    class10YearOfPassing: number
    class12Percentage: number
    class12Board: string
    class12YearOfPassing: number
    class12Stream: string
    hasJeeMainsScore: boolean
    jeeMainsScore?: number
    jeeMainsRank?: number
    jeeMainsYear?: number
  }
  coursePreference?: {
    preferredCourseId: string
  }
}

interface ApplicationContextType {
  applications: Application[]
  application: Application | null
  currentStep: number
  formData: FormData
  isLoading: boolean
  setApplications: (applications: Application[]) => void
  setCurrentApplication: (application: Application | null) => void
  setCurrentStep: (step: number) => void
  updateFormData: (section: keyof FormData, data: any) => void
  saveApplication: () => Promise<boolean>
  submitApplication: () => Promise<boolean>
  refreshApplications: () => Promise<void>
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined)

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([])
  const [application, setCurrentApplication] = useState<Application | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({})
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const updateFormData = (section: keyof FormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }))
  }

  const saveApplication = async (): Promise<boolean> => {
    // Auto-save functionality - could be implemented later
    return true
  }

  const submitApplication = async (): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit an application",
        variant: "destructive",
      })
      return false
    }

    if (!formData.personalInfo || !formData.addressInfo || !formData.academicInfo || !formData.coursePreference) {
      toast({
        title: "Error",
        description: "Please complete all required sections",
        variant: "destructive",
      })
      return false
    }

    setIsLoading(true)
    try {
      const applicationData: CreateApplicationRequest = {
        ...formData.personalInfo,
        ...formData.addressInfo,
        ...formData.academicInfo,
        preferredCourseId: formData.coursePreference.preferredCourseId,
        userId: user.id,
      }

      const response = await apiClient.createApplication(applicationData)
      
      if (response.success) {
        setCurrentApplication(response.data)
        toast({
          title: "Success",
          description: "Application submitted successfully",
        })
        return true
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to submit application",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const refreshApplications = async () => {
    if (!user) return

    try {
      const response = await apiClient.getApplications({ userId: user.id })
      if (response.success && response.data) {
        setApplications(response.data)
        // Set the most recent application as current
        if (response.data.length > 0) {
          setCurrentApplication(response.data[0])
        }
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error)
    }
  }

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        application,
        currentStep,
        formData,
        isLoading,
        setApplications,
        setCurrentApplication,
        setCurrentStep,
        updateFormData,
        saveApplication,
        submitApplication,
        refreshApplications,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  )
}

export function useApplication() {
  const context = useContext(ApplicationContext)
  if (context === undefined) {
    throw new Error("useApplication must be used within an ApplicationProvider")
  }
  return context
}
