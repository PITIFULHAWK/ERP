"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Home, Plus, Search, Users, Bed, Phone, Mail, UserPlus, Check } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import { Hostel } from "@/types/academic"
import { University } from "@/types/university"

interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

interface EligibleStudent {
  id: string
  name: string
  email: string
  application: {
    id: string
    status: string
    preferredCourse: {
      id: string
      name: string
      code: string
    }
  }
  coursePayment: {
    id: string
    status: string
    amount: number
  }
  hostelPayment: {
    id: string
    status: string
    amount: number
  }
}

export default function HostelsPage() {
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [eligibleStudents, setEligibleStudents] = useState<EligibleStudent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null)
  const [assignStudentDialogOpen, setAssignStudentDialogOpen] = useState(false)
  const [assigningStudent, setAssigningStudent] = useState(false)
  const [addHostelDialogOpen, setAddHostelDialogOpen] = useState(false)
  const [creatingHostel, setCreatingHostel] = useState(false)
  const [newHostelData, setNewHostelData] = useState({
    name: "",
    fees: "",
    totalCapacity: "",
    type: "AC" as "AC" | "NON_AC",
    universityId: ""
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch hostels
        const hostelResponse = await apiClient.getHostels() as ApiResponse<Hostel[]>
        if (hostelResponse.success && hostelResponse.data) {
          setHostels(hostelResponse.data)
        }

        // Fetch universities
        const universitiesResponse = await apiClient.getUniversities() as ApiResponse<University[]>
        if (universitiesResponse.success && universitiesResponse.data) {
          setUniversities(universitiesResponse.data)
        }

        // Fetch eligible students (those with verified applications, course payments, and hostel payments)
        await fetchEligibleStudents()
        
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [])

  const fetchEligibleStudents = async () => {
    try {
      // Get verified applications
      const applicationsResponse = await apiClient.getApplications({ status: "VERIFIED" }) as ApiResponse<Array<{
        id: string;
        userId: string;
        status: string;
        preferredCourseId: string;
        user: { name: string; email: string };
        preferredCourse: { id: string; name: string; code: string };
      }>>
      
      if (!applicationsResponse.success || !applicationsResponse.data) {
        return
      }

      const verifiedApplications = applicationsResponse.data
      const eligibleStudentsList: EligibleStudent[] = []

      // For each verified application, check if they have successful course and hostel payments
      for (const application of verifiedApplications) {
        try {
          const paymentsResponse = await apiClient.getPayments({ 
            userId: application.userId,
            status: "VERIFIED" 
          }) as ApiResponse<Array<{
            id: string;
            type: string;
            status: string;
            amount: number;
            courseId?: string;
          }>>

          if (paymentsResponse.success && paymentsResponse.data) {
            const payments = paymentsResponse.data
            const coursePayment = payments.find(p => p.type === "COURSE" && p.courseId === application.preferredCourseId)
            const hostelPayment = payments.find(p => p.type === "HOSTEL")

            if (coursePayment && hostelPayment) {
              eligibleStudentsList.push({
                id: application.userId,
                name: application.user.name,
                email: application.user.email,
                application: {
                  id: application.id,
                  status: application.status,
                  preferredCourse: application.preferredCourse
                },
                coursePayment: {
                  id: coursePayment.id,
                  status: coursePayment.status,
                  amount: coursePayment.amount
                },
                hostelPayment: {
                  id: hostelPayment.id,
                  status: hostelPayment.status,
                  amount: hostelPayment.amount
                }
              })
            }
          }
        } catch (error) {
          console.error(`Failed to fetch payments for user ${application.userId}:`, error)
        }
      }

      setEligibleStudents(eligibleStudentsList)
    } catch (error) {
      console.error("Failed to fetch eligible students:", error)
    }
  }

  const handleAssignStudent = async (studentId: string, hostelId: string) => {
    try {
      setAssigningStudent(true)
      
      const response = await apiClient.addStudentToHostel(hostelId, studentId) as ApiResponse
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Student successfully assigned to hostel",
        })
        
        // Refresh data
        await fetchEligibleStudents()
        const hostelResponse = await apiClient.getHostels() as ApiResponse<Hostel[]>
        if (hostelResponse.success && hostelResponse.data) {
          setHostels(hostelResponse.data)
        }
        
        setAssignStudentDialogOpen(false)
        setSelectedHostel(null)
      } else {
        throw new Error("Failed to assign student")
      }
    } catch (error) {
      console.error("Failed to assign student:", error)
      toast({
        title: "Error",
        description: "Failed to assign student to hostel",
        variant: "destructive",
      })
    } finally {
      setAssigningStudent(false)
    }
  }

  const handleOpenAssignDialog = (hostel: Hostel) => {
    setSelectedHostel(hostel)
    setAssignStudentDialogOpen(true)
  }

  const handleOpenAddHostelDialog = () => {
    setNewHostelData({
      name: "",
      fees: "",
      totalCapacity: "",
      type: "AC",
      universityId: ""
    })
    setAddHostelDialogOpen(true)
  }

  const handleCreateHostel = async () => {
    try {
      setCreatingHostel(true)
      
      // Validate required fields
      if (!newHostelData.name || !newHostelData.fees || !newHostelData.totalCapacity || !newHostelData.universityId) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const hostelData = {
        name: newHostelData.name,
        fees: parseFloat(newHostelData.fees),
        totalCapacity: parseInt(newHostelData.totalCapacity),
        type: newHostelData.type,
        universityId: newHostelData.universityId
      }

      const response = await apiClient.createHostel(hostelData) as ApiResponse<Hostel>
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Hostel created successfully",
        })
        
        // Refresh hostels data
        const hostelResponse = await apiClient.getHostels() as ApiResponse<Hostel[]>
        if (hostelResponse.success && hostelResponse.data) {
          setHostels(hostelResponse.data)
        }
        
        setAddHostelDialogOpen(false)
      } else {
        throw new Error("Failed to create hostel")
      }
    } catch (error) {
      console.error("Failed to create hostel:", error)
      toast({
        title: "Error",
        description: "Failed to create hostel",
        variant: "destructive",
      })
    } finally {
      setCreatingHostel(false)
    }
  }

  const filteredHostels = hostels.filter((hostel) => {
    const matchesSearch =
      hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostel.university.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || hostel.type === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case "AC":
        return "bg-blue-100 text-blue-800"
      case "NON_AC":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOccupancyRate = (occupied: number, capacity: number) => {
    return Math.round((occupied / capacity) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hostel Management</h1>
          <p className="text-muted-foreground">Manage university hostels and accommodation</p>
        </div>
        <Button onClick={handleOpenAddHostelDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Hostel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hostels</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hostels.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hostels.reduce((sum, h) => sum + h.totalCapacity, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Beds</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hostels.reduce((sum, h) => sum + h.currentTotalStudents, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (hostels.reduce((sum, h) => sum + h.currentTotalStudents, 0) / hostels.reduce((sum, h) => sum + h.totalCapacity, 0)) *
                  100,
              )}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search hostels or wardens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Hostel Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="AC">AC</SelectItem>
                <SelectItem value="NON_AC">Non-AC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Hostels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Hostels ({filteredHostels.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hostel Details</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Warden</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHostels.map((hostel) => (
                <TableRow key={hostel.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{hostel.name}</div>
                      <div className="text-sm text-muted-foreground">{hostel.university.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(hostel.type)}>{hostel.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {hostel.currentTotalStudents}/{hostel.totalCapacity}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getOccupancyRate(hostel.currentTotalStudents, hostel.totalCapacity)}% occupied
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">-</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1" />
                        -
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        -
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenAssignDialog(hostel)}
                        disabled={hostel.currentTotalStudents >= hostel.totalCapacity}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Assign Student
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Student Dialog */}
      <Dialog open={assignStudentDialogOpen} onOpenChange={setAssignStudentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Student to {selectedHostel?.name}</DialogTitle>
            <DialogDescription>
              Select an eligible student to assign to this hostel. Students must have verified applications, 
              course enrollment, and completed hostel fees payment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {eligibleStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Eligible Students</h3>
                <p className="text-muted-foreground">
                  No students meet the requirements for hostel assignment. 
                  Students need verified applications, course enrollment, and completed hostel fees payment.
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Application</TableHead>
                      <TableHead>Payments</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eligibleStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.application.preferredCourse.name}</div>
                            <div className="text-sm text-muted-foreground">{student.application.preferredCourse.code}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            {student.application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Course: ₹{student.coursePayment.amount}
                            </Badge>
                            <br />
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Hostel: ₹{student.hostelPayment.amount}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleAssignStudent(student.id, selectedHostel!.id)}
                            disabled={assigningStudent}
                          >
                            {assigningStudent ? "Assigning..." : "Assign"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Hostel Dialog */}
      <Dialog open={addHostelDialogOpen} onOpenChange={setAddHostelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Hostel</DialogTitle>
            <DialogDescription>
              Create a new hostel for the university.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hostel-name">Hostel Name *</Label>
              <Input
                id="hostel-name"
                placeholder="Enter hostel name"
                value={newHostelData.name}
                onChange={(e) => setNewHostelData({ ...newHostelData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hostel-fees">Fees (₹) *</Label>
              <Input
                id="hostel-fees"
                type="number"
                placeholder="Enter hostel fees"
                value={newHostelData.fees}
                onChange={(e) => setNewHostelData({ ...newHostelData, fees: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hostel-capacity">Total Capacity *</Label>
              <Input
                id="hostel-capacity"
                type="number"
                placeholder="Enter total capacity"
                value={newHostelData.totalCapacity}
                onChange={(e) => setNewHostelData({ ...newHostelData, totalCapacity: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hostel-type">Type *</Label>
              <Select value={newHostelData.type} onValueChange={(value: "AC" | "NON_AC") => setNewHostelData({ ...newHostelData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hostel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AC">AC</SelectItem>
                  <SelectItem value="NON_AC">Non-AC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="university-id">University *</Label>
              <Select value={newHostelData.universityId} onValueChange={(value) => setNewHostelData({ ...newHostelData, universityId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((university) => (
                    <SelectItem key={university.id} value={university.id}>
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setAddHostelDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateHostel} disabled={creatingHostel}>
                {creatingHostel ? "Creating..." : "Create Hostel"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
