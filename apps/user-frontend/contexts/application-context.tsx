"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import type { Application } from "@/types"

interface ApplicationContextType {
  applications: Application[]
  currentApplication: Application | null
  setApplications: (applications: Application[]) => void
  setCurrentApplication: (application: Application | null) => void
  refreshApplications: () => Promise<void>
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined)

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([])
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null)

  const refreshApplications = async () => {
    // This would typically fetch from API
    // For now, we'll leave it as a placeholder
  }

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        currentApplication,
        setApplications,
        setCurrentApplication,
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
