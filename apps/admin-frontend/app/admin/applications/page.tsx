"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApplicationFiltersComponent } from "@/components/applications/application-filters"
import { ApplicationsTable } from "@/components/applications/applications-table"
import { Download, RefreshCw } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import type { Application, ApplicationFilters } from "@/types/application"

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filters, setFilters] = useState<ApplicationFilters>({})


  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getApplications(filters)
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
