"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApplicationFiltersComponent } from "@/components/applications/application-filters"
import { ApplicationsTable } from "@/components/applications/applications-table"
import { Download, RefreshCw } from "lucide-react"
import type { Application, ApplicationFilters } from "@/types/application"

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filters, setFilters] = useState<ApplicationFilters>({})

  // Mock data for demonstration
  const mockApplications: Application[] = [
    {
      id: "1",
      firstName: "Sarah",
      lastName: "Johnson",
      dateOfBirth: "2000-05-15",
      gender: "FEMALE",
      nationality: "Indian",
      phoneNumber: "+91-9876543210",
      address: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      class10Percentage: 85.5,
      class10Board: "CBSE",
      class10YearOfPassing: 2018,
      class12Percentage: 88.2,
      class12Board: "CBSE",
      class12YearOfPassing: 2020,
      class12Stream: "Science",
      hasJeeMainsScore: true,
      jeeMainsScore: 245,
      jeeMainsRank: 15000,
      jeeMainsYear: 2020,
      preferredCourseId: "cs-1",
      preferredCourse: {
        id: "cs-1",
        name: "Computer Science Engineering",
        code: "CSE",
        university: {
          id: "univ-1",
          name: "Indian Institute of Technology",
        },
      },
      status: "PENDING",
      documents: [],
      user: {
        id: "user-1",
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
      },
      userId: "user-1",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      firstName: "Michael",
      lastName: "Chen",
      dateOfBirth: "1999-12-08",
      gender: "MALE",
      nationality: "Indian",
      phoneNumber: "+91-9876543211",
      address: "456 Oak Avenue",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      class10Percentage: 92.0,
      class10Board: "CBSE",
      class10YearOfPassing: 2017,
      class12Percentage: 94.5,
      class12Board: "CBSE",
      class12YearOfPassing: 2019,
      class12Stream: "Science",
      hasJeeMainsScore: true,
      jeeMainsScore: 285,
      jeeMainsRank: 8500,
      jeeMainsYear: 2019,
      preferredCourseId: "ee-1",
      preferredCourse: {
        id: "ee-1",
        name: "Electrical Engineering",
        code: "EE",
        university: {
          id: "univ-1",
          name: "Indian Institute of Technology",
        },
      },
      status: "UNDER_REVIEW",
      documents: [],
      user: {
        id: "user-2",
        name: "Michael Chen",
        email: "michael.chen@email.com",
      },
      userId: "user-2",
      createdAt: "2024-01-14T14:20:00Z",
      updatedAt: "2024-01-16T09:15:00Z",
    },
    {
      id: "3",
      firstName: "Emily",
      lastName: "Davis",
      dateOfBirth: "2001-03-22",
      gender: "FEMALE",
      nationality: "Indian",
      phoneNumber: "+91-9876543212",
      address: "789 Pine Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      class10Percentage: 89.8,
      class10Board: "ICSE",
      class10YearOfPassing: 2019,
      class12Percentage: 91.2,
      class12Board: "ICSE",
      class12YearOfPassing: 2021,
      class12Stream: "Commerce",
      hasJeeMainsScore: false,
      preferredCourseId: "ba-1",
      preferredCourse: {
        id: "ba-1",
        name: "Business Administration",
        code: "BBA",
        university: {
          id: "univ-2",
          name: "Delhi University",
        },
      },
      status: "VERIFIED",
      verifiedBy: {
        id: "admin-1",
        name: "Admin User",
        email: "admin@university.edu",
      },
      verifiedAt: "2024-01-17T11:45:00Z",
      documents: [],
      user: {
        id: "user-3",
        name: "Emily Davis",
        email: "emily.davis@email.com",
      },
      userId: "user-3",
      createdAt: "2024-01-13T16:10:00Z",
      updatedAt: "2024-01-17T11:45:00Z",
    },
  ]

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        // In a real app, this would be: const response = await apiClient.getApplications(filters)
        // For now, we'll use mock data
        setTimeout(() => {
          setApplications(mockApplications)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch applications:", error)
        setLoading(false)
      }
    }

    fetchApplications()
  }, [filters])

  const handleBulkAction = async (action: string, ids: string[]) => {
    try {
      console.log(`Performing ${action} on applications:`, ids)
      // In a real app, implement bulk actions here
      setSelectedIds([])
    } catch (error) {
      console.error("Bulk action failed:", error)
    }
  }

  const handleExport = () => {
    // Implement CSV export functionality
    console.log("Exporting applications...")
  }

  const clearFilters = () => {
    setFilters({})
  }

  const filteredApplications = applications.filter((app) => {
    if (filters.status && app.status !== filters.status) return false
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const fullName = `${app.firstName} ${app.lastName}`.toLowerCase()
      const email = app.user.email.toLowerCase()
      const phone = app.phoneNumber.toLowerCase()
      if (!fullName.includes(searchTerm) && !email.includes(searchTerm) && !phone.includes(searchTerm)) {
        return false
      }
    }
    return true
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold">Applications</h1>
          <p className="text-muted-foreground">Manage and review student applications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">
              {applications.filter((app) => app.status === "PENDING").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">
              {applications.filter((app) => app.status === "UNDER_REVIEW").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">
              {applications.filter((app) => app.status === "VERIFIED").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ApplicationFiltersComponent filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} />

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-playfair">Applications ({filteredApplications.length})</CardTitle>
          <CardDescription>
            {selectedIds.length > 0
              ? `${selectedIds.length} applications selected`
              : "Review and manage student applications"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading applications...
            </div>
          ) : (
            <ApplicationsTable
              applications={filteredApplications}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onBulkAction={handleBulkAction}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
