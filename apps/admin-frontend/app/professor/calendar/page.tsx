"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Download, FileText, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface AcademicYear {
  id: string
  year: string
  isActive: boolean
  calendarPdfUrl?: string
  calendarPdfName?: string
  hasCalendarPDF: boolean
  university: {
    id: string
    name: string
  }
}

interface ApiResponse {
  success: boolean
  data: AcademicYear[]
  message?: string
}

export default function CalendarPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchAcademicCalendars = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getAcademicCalendars() as ApiResponse
      
      if (response.success) {
        setAcademicYears(response.data || [])
      } else {
        setError("Failed to fetch academic calendars")
      }
    } catch (err) {
      console.error("Error fetching calendars:", err)
      setError("An error occurred while fetching calendars")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch academic calendars"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCalendar = async (academicYear: AcademicYear) => {
    if (!academicYear.calendarPdfUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No calendar PDF available for this academic year"
      })
      return
    }

    try {
      window.open(academicYear.calendarPdfUrl, "_blank")
      toast({
        title: "Success",
        description: "Calendar PDF opened in new tab"
      })
    } catch (err) {
      console.error("Error downloading calendar:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to open calendar PDF"
      })
    }
  }

  useEffect(() => {
    fetchAcademicCalendars()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Calendar</h1>
          <p className="text-muted-foreground">
            View important academic dates and events
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-medium mb-2">Error Loading Calendar</p>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchAcademicCalendars} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : academicYears.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No academic calendars available</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {academicYears.map((year) => (
            <Card key={year.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Academic Year {year.year}
                      {year.isActive && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </CardTitle>
                  </div>
                  {year.hasCalendarPDF && year.calendarPdfUrl && (
                    <Button
                      onClick={() => handleDownloadCalendar(year)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {year.hasCalendarPDF ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{year.calendarPdfName || "Academic Calendar"}</span>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No calendar PDF available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}