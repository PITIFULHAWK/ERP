"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { format } from "date-fns"
import { CalendarIcon, CheckCircle, XCircle, Users, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AttendanceRecord, Section, Enrollment } from "@/types"

// Simple subject type for section assignments
type SectionSubject = {
  id: string;
  name: string;
  code: string;
}

// Professor assignment type
type ProfessorAssignment = {
  id: string;
  section: Section;
  subject: SectionSubject | null;
  isActive: boolean;
}

export function AttendanceManagement() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [sections, setSections] = useState<Section[]>([])
  const [subjects, setSubjects] = useState<SectionSubject[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [attendanceMarking, setAttendanceMarking] = useState<{[key: string]: "PRESENT" | "ABSENT"}>({})
  const [loading, setLoading] = useState(false)
  const [professorAssignments, setProfessorAssignments] = useState<ProfessorAssignment[]>([])

  const loadSections = useCallback(async () => {
    if (!user?.id) return
    
    try {
      // Load professor's assigned sections instead of all sections
      const response = await apiClient.getProfessorSections(user.id) as { success: boolean; data: ProfessorAssignment[] }
      if (response.success) {
        // Extract unique sections from professor assignments
        const uniqueSections = response.data.reduce((acc: Section[], assignment: ProfessorAssignment) => {
          const existingSection = acc.find(section => section.id === assignment.section.id)
          if (!existingSection) {
            acc.push(assignment.section)
          }
          return acc
        }, [])
        
        setSections(uniqueSections)
        setProfessorAssignments(response.data)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load assigned sections",
        variant: "destructive",
      })
    }
  }, [user?.id])

  const loadSubjects = useCallback(async () => {
    if (!selectedSection || !user?.id) {
      setSubjects([])
      return
    }
    
    try {
      // Filter professor assignments for the selected section to get only assigned subjects
      const sectionAssignments = professorAssignments.filter(
        assignment => assignment.section.id === selectedSection && assignment.subject
      )
      
      // Extract unique subjects from assignments
      const assignedSubjects = sectionAssignments.reduce((acc: SectionSubject[], assignment: ProfessorAssignment) => {
        const existingSubject = acc.find(subject => subject.id === assignment.subject?.id)
        if (!existingSubject && assignment.subject) {
          acc.push({
            id: assignment.subject.id,
            name: assignment.subject.name,
            code: assignment.subject.code
          })
        }
        return acc
      }, [])
      
      console.log(`Loaded ${assignedSubjects.length} assigned subjects for section`)
      setSubjects(assignedSubjects)
      
      // Reset selected subject if it's not in the new list
      if (selectedSubject && !assignedSubjects.find(subject => subject.id === selectedSubject)) {
        setSelectedSubject("")
      }
    } catch (error) {
      console.error("Error loading subjects:", error)
      toast({
        title: "Error",
        description: "Failed to load assigned subjects",
        variant: "destructive",
      })
    }
  }, [selectedSection, professorAssignments, user?.id, selectedSubject])

  const loadEnrollments = useCallback(async () => {
    try {
      const response = await apiClient.getEnrollments({ sectionId: selectedSection }) as { success: boolean; data: Enrollment[] }
      if (response.success) {
        setEnrollments(response.data)
        // Initialize attendance marking state
        const marking: {[key: string]: "PRESENT" | "ABSENT"} = {}
        response.data.forEach((enrollment: Enrollment) => {
          marking[enrollment.id] = "PRESENT"
        })
        setAttendanceMarking(marking)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load enrollments",
        variant: "destructive",
      })
    }
  }, [selectedSection])

  const loadAttendanceRecords = useCallback(async () => {
    if (!selectedSection || !selectedSubject || !selectedDate) {
      setAttendanceRecords([])
      return
    }

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      // Use the correct section attendance endpoint
      const response = await apiClient.getSectionAttendance(selectedSection, {
        subjectId: selectedSubject,
        date: dateStr,
      }) as { 
        success: boolean; 
        data: { 
          records: AttendanceRecord[]; 
          studentsWithoutAttendance: {
            id: string;
            name: string;
            email: string;
          }[]
        } 
      }
      
      if (response.success) {
        setAttendanceRecords(response.data.records)
        
        // Update attendance marking state with existing records
        const marking: {[key: string]: "PRESENT" | "ABSENT"} = {}
        enrollments.forEach((enrollment) => {
          const existingRecord = response.data.records.find((record: AttendanceRecord) => 
            record.enrollment.id === enrollment.id
          )
          marking[enrollment.id] = existingRecord ? existingRecord.status : "PRESENT"
        })
        setAttendanceMarking(marking)
      }
    } catch (error) {
      console.error("Failed to load attendance records:", error)
      // Don't show error toast if it's just because no attendance exists yet
      setAttendanceRecords([])
      // Initialize attendance marking to PRESENT for all students
      const marking: {[key: string]: "PRESENT" | "ABSENT"} = {}
      enrollments.forEach((enrollment) => {
        marking[enrollment.id] = "PRESENT"
      })
      setAttendanceMarking(marking)
    }
  }, [selectedSubject, selectedDate, selectedSection, enrollments])

  useEffect(() => {
    loadSections()
  }, [loadSections])

  useEffect(() => {
    loadSubjects()
  }, [loadSubjects])

  useEffect(() => {
    if (selectedSection) {
      loadEnrollments()
    }
  }, [selectedSection, loadEnrollments])

  useEffect(() => {
    if (selectedSection && selectedSubject && selectedDate) {
      loadAttendanceRecords()
    }
  }, [selectedSection, selectedSubject, selectedDate, loadAttendanceRecords])

  const handleAttendanceChange = (enrollmentId: string, status: "PRESENT" | "ABSENT") => {
    setAttendanceMarking(prev => ({
      ...prev,
      [enrollmentId]: status
    }))
  }

  const submitBulkAttendance = async () => {
    if (!selectedSubject || !selectedDate || !selectedSection) {
      toast({
        title: "Error",
        description: "Please select section, subject and date",
        variant: "destructive",
      })
      return
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Prepare attendance data in the format expected by backend
      const attendanceData = Object.entries(attendanceMarking).map(([enrollmentId, status]) => {
        const enrollment = enrollments.find(e => e.id === enrollmentId)
        return {
          studentId: enrollment?.student.id || "",
          status
        }
      }).filter(item => item.studentId) // Filter out invalid entries

      const response = await apiClient.markBulkAttendance({
        professorId: user.id,
        sectionId: selectedSection,
        subjectId: selectedSubject,
        date: format(selectedDate, "yyyy-MM-dd"),
        attendanceData
      }) as { success: boolean }

      if (response.success) {
        toast({
          title: "Success",
          description: "Attendance marked successfully",
        })
        loadAttendanceRecords()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Management</h2>
          <p className="text-muted-foreground">
            Mark and track student attendance across sections and subjects
          </p>
        </div>
      </div>

      <Tabs defaultValue="mark-attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mark-attendance">Mark Attendance</TabsTrigger>
          <TabsTrigger value="view-records">View Records</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="mark-attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Bulk Attendance Marking
              </CardTitle>
              <CardDescription>
                Select section, subject, and date to mark attendance for all students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name} ({section.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {enrollments.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Students</h3>
                    <Button onClick={submitBulkAttendance} disabled={loading}>
                      {loading ? "Marking..." : "Mark Attendance"}
                    </Button>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Attendance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrollments.map((enrollment) => (
                          <TableRow key={enrollment.id}>
                            <TableCell className="font-medium">
                              {enrollment.student.name}
                            </TableCell>
                            <TableCell>{enrollment.student.email}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={attendanceMarking[enrollment.id] === "PRESENT" ? "default" : "outline"}
                                  onClick={() => handleAttendanceChange(enrollment.id, "PRESENT")}
                                  className="flex items-center gap-1"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Present
                                </Button>
                                <Button
                                  size="sm"
                                  variant={attendanceMarking[enrollment.id] === "ABSENT" ? "destructive" : "outline"}
                                  onClick={() => handleAttendanceChange(enrollment.id, "ABSENT")}
                                  className="flex items-center gap-1"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Absent
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view-records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                View historical attendance records with filtering options
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceRecords.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.enrollment.student.firstName} {record.enrollment.student.lastName}
                          </TableCell>
                          <TableCell>{record.subject.name}</TableCell>
                          <TableCell>{format(new Date(record.date), "PPP")}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={record.status === "PRESENT" ? "default" : "destructive"}
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records found for the selected criteria
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Attendance Analytics
              </CardTitle>
              <CardDescription>
                View attendance statistics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Attendance analytics coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}