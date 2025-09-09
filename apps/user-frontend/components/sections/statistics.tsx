"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"

interface StatItem {
  label: string
  value: string
  description: string
}

export function Statistics() {
  const [stats, setStats] = useState<StatItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const [coursesResponse, universitiesResponse, applicationsResponse] = await Promise.all([
        apiClient.getCourses(),
        apiClient.getUniversities(),
        apiClient.getMyApplications().catch(() => ({ success: false, data: [] })) // Handle if no access
      ])

      let programsCount = 0
      let universitiesCount = 0
      let applicationsCount = 0

      if (coursesResponse.success && coursesResponse.data) {
        programsCount = coursesResponse.data.length
      }

      if (universitiesResponse.success && universitiesResponse.data) {
        universitiesCount = universitiesResponse.data.length
      }

      if (applicationsResponse.success && applicationsResponse.data) {
        applicationsCount = applicationsResponse.data.length
      }

      const calculatedStats: StatItem[] = [
        { 
          label: "Programs", 
          value: `${programsCount}+`, 
          description: "Available courses" 
        },
        { 
          label: "Universities", 
          value: `${universitiesCount}+`, 
          description: "Partner institutions" 
        },
        { 
          label: "Applications", 
          value: `${applicationsCount}+`, 
          description: "Active submissions" 
        },
        { 
          label: "Success Rate", 
          value: "95%", 
          description: "Application approval" 
        },
      ]

      setStats(calculatedStats)
    } catch (error) {
      console.error("Failed to fetch statistics:", error)
      // Fallback to default stats if API fails
      setStats([
        { label: "Programs", value: "120+", description: "Available courses" },
        { label: "Universities", value: "50+", description: "Partner institutions" },
        { label: "Applications", value: "1000+", description: "Active submissions" },
        { label: "Success Rate", value: "95%", description: "Application approval" },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-16 bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeleton
            [...Array(4)].map((_, index) => (
              <Card key={index} className="text-center border-0 shadow-sm">
                <CardContent className="p-6">
                  <Skeleton className="h-10 w-16 mx-auto mb-2" />
                  <Skeleton className="h-6 w-20 mx-auto mb-1" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </CardContent>
              </Card>
            ))
          ) : (
            // Actual statistics
            stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-lg font-semibold text-foreground mb-1">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.description}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
