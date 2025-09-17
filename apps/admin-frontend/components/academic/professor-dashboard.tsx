"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { ProfessorHeader } from "@/components/professor-header"
import { ProfessorSidebar } from "@/components/professor-sidebar"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import { 
  CalendarDays, 
  ClipboardCheck, 
  BookOpen, 
  GraduationCap,
  Users,
  Award,
  FileText,
  Eye,
  Download,
  Calendar
} from "lucide-react"

// Import existing academic components
import { AttendanceManagement } from "./attendance-management"
import { GradeManagement } from "./grade-management"
import { ResourceManagement } from "./resource-management"

// Types for academic years response
interface AcademicYearItem {
  id: string
  year: string
  startDate: string
  endDate: string
  isActive: boolean
  universityId: string
  calendarPdfUrl: string | null
  calendarPdfName: string | null
  calendarCloudinaryPublicId: string | null
  calendarUploadedAt: string | null
  createdAt: string
  updatedAt: string
  university: {
    id: string
    name: string
    uid: number
  }
  _count: {
    enrollments: number
    sections: number
    liveClasses: number
  }
}

interface ApiResponse {
  success: boolean
  data?: AcademicYearItem[]
  message?: string
}

// Professor Calendar View Component (Read-only)
function ProfessorCalendarView() {
  const { user } = useAuth()
  const [academicYears, setAcademicYears] = useState<AcademicYearItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAcademicCalendar = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch academic years data with university filtering
        const response = await apiClient.getAcademicYears(user?.universityId) as ApiResponse
        
        if (response.success) {
          setAcademicYears(response.data || [])
        } else {
          setError(response.message || 'Failed to fetch academic calendar')
        }
      } catch (err) {
        console.error('Error fetching academic calendar:', err)
        setError('Failed to load academic calendar data')
      } finally {
        setLoading(false)
      }
    }

    fetchAcademicCalendar()
  }, [user?.universityId])

  const handleDownloadCalendar = async (pdfUrl: string, fileName: string) => {
    try {
      // Simply use the calendarPdfUrl from the API response to download
      if (pdfUrl) {
        const link = document.createElement('a')
        link.href = pdfUrl
        link.download = fileName || 'academic-calendar.pdf'
        link.target = '_blank' // Open in new tab if download fails
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast({
          title: "Download Started",
          description: `Downloading ${fileName || 'academic calendar'}...`,
        })
      }
    } catch (err) {
      console.error('Error downloading calendar:', err)
      toast({
        title: "Download Failed",
        description: "Failed to download academic calendar",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Calendar</h1>
          <p className="text-muted-foreground">
            View and download academic calendars for reference
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          View Only
        </Badge>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">Loading Academic Calendar</h3>
            <p className="text-muted-foreground text-center">
              Fetching academic calendar data...
            </p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarDays className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-destructive">Error Loading Calendar</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {error}
            </p>
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Please try refreshing the page or contact support if the issue persists.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : academicYears.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarDays className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Academic Calendar Available</h3>
            <p className="text-muted-foreground text-center max-w-md">
              No academic calendar has been uploaded for your university yet.
            </p>
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Contact the academic office for more information about calendar availability.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {academicYears.map((academicYear) => (
            <Card key={academicYear.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Academic Year {academicYear.year}
                    </CardTitle>
                    <CardDescription>
                      {new Date(academicYear.startDate).toLocaleDateString()} - {new Date(academicYear.endDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={academicYear.isActive ? "default" : "secondary"}>
                      {academicYear.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {academicYear.calendarPdfUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadCalendar(academicYear.calendarPdfUrl!, academicYear.calendarPdfName || 'academic-calendar.pdf')}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {academicYear.calendarPdfUrl ? (
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div className="flex-1">
                        <p className="font-medium text-green-800 dark:text-green-300">
                          PDF Calendar Available
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {academicYear.calendarPdfName} • Uploaded {academicYear.calendarUploadedAt ? new Date(academicYear.calendarUploadedAt).toLocaleDateString() : 'recently'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <CalendarDays className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      <div className="flex-1">
                        <p className="font-medium text-yellow-800 dark:text-yellow-300">
                          Calendar Pending Upload
                        </p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          Academic calendar PDF has not been uploaded for this year yet
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{academicYear._count.enrollments} Enrollments</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{academicYear._count.sections} Sections</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>{academicYear.university.name}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Professor Sections View Component
function ProfessorSectionsView() {
  const { user } = useAuth()
  const [sectionsData, setSectionsData] = useState<Array<{
    id: string
    professorId: string
    sectionId: string
    subjectId: string
    isActive: boolean
    assignmentType: string
    section: {
      id: string
      name: string
      code: string
      description?: string
      maxStudents: number
      currentStudents: number
      course: {
        id: string
        name: string
        code: string
      }
      semester: {
        id: string
        code: string
        number: number
      }
      academicYear: {
        id: string
        year: string
        isActive: boolean
      }
    }
    subject: {
      id: string
      name: string
      code: string
    }
  }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSectionsData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        const response = await apiClient.getProfessorSections(user.id) as {
          success: boolean
          data: Array<{
            id: string
            professorId: string
            sectionId: string
            subjectId: string
            isActive: boolean
            assignmentType: string
            section: {
              id: string
              name: string
              code: string
              description?: string
              maxStudents: number
              currentStudents: number
              course: {
                id: string
                name: string
                code: string
              }
              semester: {
                id: string
                code: string
                number: number
              }
              academicYear: {
                id: string
                year: string
                isActive: boolean
              }
            }
            subject: {
              id: string
              name: string
              code: string
            }
          }>
        }

        if (response.success && response.data) {
          setSectionsData(response.data.filter(assignment => assignment.isActive))
        }
      } catch (error) {
        console.error("Failed to fetch professor sections:", error)
        toast({
          title: "Error",
          description: "Failed to load your sections",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSectionsData()
  }, [user?.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">My Sections</h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading your sections...</div>
        </div>
      </div>
    )
  }

  if (sectionsData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">My Sections</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sections Assigned</h3>
            <p className="text-muted-foreground text-center">
              You are not currently assigned to any sections. Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Sections</h1>
          <p className="text-muted-foreground">
            Manage your assigned sections and subjects
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {sectionsData.length} Section{sectionsData.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-6">
        {sectionsData.map((assignment) => (
          <Card key={assignment.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    {assignment.section.name} ({assignment.section.code})
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {assignment.section.course.name} • {assignment.subject.name} ({assignment.subject.code})
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={assignment.assignmentType === "INSTRUCTOR" ? "default" : "secondary"}>
                    {assignment.assignmentType === "INSTRUCTOR" ? "Primary Instructor" : "Teaching Assistant"}
                  </Badge>
                  <Badge variant="outline">
                    {assignment.section.semester.code}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Course</p>
                  <p className="font-medium">{assignment.section.course.name}</p>
                  <p className="text-sm text-muted-foreground">{assignment.section.course.code}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Subject</p>
                  <p className="font-medium">{assignment.subject.name}</p>
                  <p className="text-sm text-muted-foreground">{assignment.subject.code}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Students</p>
                  <p className="font-medium">{assignment.section.currentStudents} / {assignment.section.maxStudents}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((assignment.section.currentStudents / assignment.section.maxStudents) * 100)}% capacity
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Academic Year</p>
                  <p className="font-medium">{assignment.section.academicYear.year}</p>
                  <p className="text-sm text-muted-foreground">
                    Semester {assignment.section.semester.number}
                  </p>
                </div>
              </div>
              {assignment.section.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{assignment.section.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ProfessorDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [dashboardData, setDashboardData] = useState({
    sectionsCount: 0,
    coursesCount: 0,
    loading: true
  })

  // Fetch professor dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return

      try {
        setDashboardData(prev => ({ ...prev, loading: true }))
        
        console.log("Fetching sections for professor ID:", user.id)
        
        // Fetch professor sections
        const sectionsResponse = await apiClient.getProfessorSections(user.id) as {
          success: boolean
          data: Array<{
            id: string
            professorId: string
            sectionId: string
            subjectId: string
            isActive: boolean
            section: {
              id: string
              name: string
              code: string
              course: {
                id: string
                name: string
                code: string
              }
            }
            subject: {
              id: string
              name: string
              code: string
            }
          }>
        }

        console.log("Professor sections API response:", sectionsResponse)

        if (sectionsResponse.success && sectionsResponse.data) {
          const assignments = Array.isArray(sectionsResponse.data) ? sectionsResponse.data : []
          console.log("Processed assignments array:", assignments)
          
          // Extract unique sections and courses
          const uniqueSections = new Set(assignments.map(assignment => assignment.section.id))
          const uniqueCourses = new Set(assignments.map(assignment => assignment.section.course.id))
          
          console.log("Unique sections:", Array.from(uniqueSections))
          console.log("Unique courses:", Array.from(uniqueCourses))
          
          setDashboardData({
            sectionsCount: uniqueSections.size,
            coursesCount: uniqueCourses.size,
            loading: false
          })
        } else {
          console.log("API response was not successful or no data:", sectionsResponse)
          setDashboardData({
            sectionsCount: 0,
            coursesCount: 0,
            loading: false
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
        setDashboardData({
          sectionsCount: 0,
          coursesCount: 0,
          loading: false
        })
      }
    }

    fetchDashboardData()
  }, [user?.id])

  if (!user || user.role !== "PROFESSOR") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            This dashboard is only available for professors.
          </p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "attendance":
        return <AttendanceManagement />
      case "grades":
        return <GradeManagement />
      case "resources":
        return <ResourceManagement />
      case "calendar":
        return <ProfessorCalendarView />
      case "sections":
        return <ProfessorSectionsView />
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome back, Prof. {user.name}!
                </h1>
                <p className="text-muted-foreground">
                  Manage your classes, grades, and resources from your dashboard.
                </p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Professor
              </Badge>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    My Sections
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.loading ? (
                      <div className="animate-pulse bg-muted rounded h-8 w-12"></div>
                    ) : (
                      dashboardData.sectionsCount
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total sections allocated to you
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Courses
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.loading ? (
                      <div className="animate-pulse bg-muted rounded h-8 w-12"></div>
                    ) : (
                      dashboardData.coursesCount
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Courses you are teaching
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities and Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>
                    Your latest actions in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          Marked attendance for CS101 Section A
                        </p>
                        <p className="text-xs text-muted-foreground">
                          2 hours ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          Added grades for Mid-term Exam
                        </p>
                        <p className="text-xs text-muted-foreground">
                          1 day ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          Uploaded new resource material
                        </p>
                        <p className="text-xs text-muted-foreground">
                          3 days ago
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks you can perform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <button
                      onClick={() => setActiveTab("attendance")}
                      className="flex items-center justify-between p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardCheck className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Mark Attendance</span>
                      </div>
                      <span className="text-xs text-muted-foreground">→</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("grades")}
                      className="flex items-center justify-between p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Add Grades</span>
                      </div>
                      <span className="text-xs text-muted-foreground">→</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("resources")}
                      className="flex items-center justify-between p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-purple-500" />
                        <span className="font-medium">Upload Resources</span>
                      </div>
                      <span className="text-xs text-muted-foreground">→</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("calendar")}
                      className="flex items-center justify-between p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">View Calendar</span>
                      </div>
                      <span className="text-xs text-muted-foreground">→</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar - Fixed height */}
      <ProfessorSidebar 
        className="flex-shrink-0" 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <ProfessorHeader title="Professor Dashboard" />
        
        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-auto bg-background p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}