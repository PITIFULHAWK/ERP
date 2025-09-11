"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApplicationFiltersComponent } from "@/components/applications/application-filters"
import { ApplicationsTable } from "@/components/applications/applications-table"
import { Download, RefreshCw } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import type { Application, ApplicationFilters } from "@/types/application"
import type { ApiResponse } from "@/types/api"

export default function ApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filters, setFilters] = useState<ApplicationFilters>({})


  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getApplications(filters) as ApiResponse<Application[]>
        if (response.success && response.data) {
          setApplications(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error)
        toast({
          title: "Error",
          description: "Failed to load applications",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [filters])

  const handleBulkAction = async (action: string, ids: string[]) => {
    if (bulkActionLoading) return // Prevent multiple simultaneous actions
    
    try {
      setBulkActionLoading(true)
      console.log(`Performing ${action} on applications:`, ids)
      
      switch (action) {
        case "approve":
          const approvePromises = ids.map(id => {
            console.log(`Approving application ${id}`)
            return apiClient.verifyApplication(id, { 
              status: "VERIFIED",
              remarks: "Application verified by admin",
              verifierId: user?.id || "admin-user-id"
            })
          })
          await Promise.all(approvePromises)
          toast({
            title: "Success",
            description: `${ids.length} application(s) approved successfully`,
          })
          break
          
        case "review":
          const reviewPromises = ids.map(id => {
            console.log(`Moving application ${id} to review`)
            return apiClient.verifyApplication(id, { 
              status: "UNDER_REVIEW",
              remarks: "Application moved to review",
              verifierId: user?.id || "admin-user-id"
            })
          })
          await Promise.all(reviewPromises)
          toast({
            title: "Success",
            description: `${ids.length} application(s) moved to review`,
          })
          break
          
        case "reject":
          const rejectPromises = ids.map(id => {
            console.log(`Rejecting application ${id}`)
            return apiClient.verifyApplication(id, { 
              status: "REJECTED",
              remarks: "Application rejected by admin",
              verifierId: user?.id || "admin-user-id"
            })
          })
          await Promise.all(rejectPromises)
          toast({
            title: "Success",
            description: `${ids.length} application(s) rejected`,
          })
          break
          
        default:
          console.warn("Unknown bulk action:", action)
          return
      }
      
      // Refresh the applications list
      console.log("Refreshing applications list...")
      setSelectedIds([])
      const response = await apiClient.getApplications(filters) as ApiResponse<Application[]>
      console.log("Applications refresh response:", response)
      if (response.success && response.data) {
        setApplications(response.data)
        console.log("Applications updated successfully")
      } else {
        console.error("Failed to refresh applications:", response)
        toast({
          title: "Warning",
          description: "Actions completed but failed to refresh list. Please refresh the page.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Bulk action failed:", error)
      toast({
        title: "Error",
        description: `Failed to perform ${action} on selected applications: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleExport = () => {
    try {
      // Create CSV content
      const csvHeaders = [
        "Application ID",
        "Full Name",
        "Email",
        "Phone",
        "Status",
        "Preferred Course",
        "University",
        "Class 10 %",
        "Class 12 %",
        "Applied Date"
      ]
      
      const csvData = filteredApplications.map(app => [
        app.id,
        `${app.firstName} ${app.lastName}`,
        app.user?.email || "N/A",
        app.phoneNumber,
        app.status,
        app.preferredCourse?.name || "N/A",
        app.preferredCourse?.university?.name || "N/A",
        app.class10Percentage,
        app.class12Percentage,
        new Date(app.createdAt).toLocaleDateString()
      ])
      
      const csvContent = [
        csvHeaders.join(","),
        ...csvData.map(row => row.map(field => `"${field}"`).join(","))
      ].join("\n")
      
      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      
      link.setAttribute("href", url)
      link.setAttribute("download", `applications_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Success",
        description: `Exported ${filteredApplications.length} applications to CSV`,
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Error",
        description: "Failed to export applications",
        variant: "destructive",
      })
    }
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
              isLoading={bulkActionLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
