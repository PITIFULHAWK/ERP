"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserFiltersComponent } from "@/components/users/user-filters"
import { UsersTable } from "@/components/users/users-table"
import { Download, RefreshCw, UserPlus } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import type { User, UserFilters } from "@/types/user"
import type { ApiResponse } from "@/types/api"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filters, setFilters] = useState<UserFilters>({})
  const [reloadKey, setReloadKey] = useState(0)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getUsers(filters) as ApiResponse<User[]>
        if (response.success && response.data) {
          setUsers(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [filters, reloadKey])

  const handleRefresh = () => setReloadKey(k => k + 1)

  const handleBulkAction = async (action: string, ids: string[]) => {
    try {
      console.log(`Performing ${action} on users:`, ids)
      
      switch (action) {
        case "verify":
          await Promise.all(
            ids.map(id => apiClient.updateUser(id, { userStatus: "VERIFIED" }))
          )
          toast({
            title: "Success",
            description: `${ids.length} user(s) verified successfully`,
          })
          break
          
        case "promote":
          await Promise.all(
            ids.map(id => apiClient.updateUserRole(id, "STUDENT"))
          )
          toast({
            title: "Success",
            description: `${ids.length} user(s) promoted to student successfully`,
          })
          break
        
        case "promote_prof":
          await Promise.all(
            ids.map(id => apiClient.updateUserRole(id, "PROFESSOR"))
          )
          toast({
            title: "Success",
            description: `${ids.length} user(s) promoted to professor successfully`,
          })
          break
          
        case "delete":
          if (!confirm(`Are you sure you want to delete ${ids.length} user(s)? This action cannot be undone.`)) {
            return
          }
          await Promise.all(
            ids.map(id => apiClient.deleteUser(id))
          )
          toast({
            title: "Success",
            description: `${ids.length} user(s) deleted successfully`,
          })
          break
          
        default:
          console.warn("Unknown bulk action:", action)
          return
      }
      
      // Refresh the users list
      setSelectedIds([])
      const response = await apiClient.getUsers(filters) as ApiResponse<User[]>
      if (response.success && response.data) {
        setUsers(response.data)
      }
    } catch (error) {
      console.error("Bulk action failed:", error)
      toast({
        title: "Error",
        description: `Failed to perform ${action} on selected users`,
        variant: "destructive",
      })
    }
  }

  const handleExport = () => {
    try {
      // Create CSV content
      const csvHeaders = [
        "Name",
        "Email", 
        "Role",
        "Status",
        "University",
        "Joined Date"
      ]
      
      const csvData = filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.userStatus,
        user.university?.name || "N/A",
        new Date(user.createdAt).toLocaleDateString()
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
      link.setAttribute("download", `users_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Success",
        description: `Exported ${filteredUsers.length} users to CSV`,
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Error",
        description: "Failed to export users",
        variant: "destructive",
      })
    }
  }

  const clearFilters = () => {
    setFilters({})
  }

  const filteredUsers = users.filter((user) => {
    if (filters.role && user.role !== filters.role) return false
    if (filters.userStatus && user.userStatus !== filters.userStatus) return false
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const name = user.name.toLowerCase()
      const email = user.email.toLowerCase()
      if (!name.includes(searchTerm) && !email.includes(searchTerm)) {
        return false
      }
    }
    return true
  })

  const getRoleCount = (role: string) => users.filter((user) => user.role === role).length
  const getStatusCount = (status: string) => users.filter((user) => user.userStatus === status).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold">Users</h1>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{getRoleCount("ADMIN")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">{getRoleCount("STUDENT")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{getStatusCount("VERIFIED")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{getStatusCount("NOT_VERIFIED")}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <UserFiltersComponent filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-playfair">Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            {selectedIds.length > 0 ? `${selectedIds.length} users selected` : "Manage system users and permissions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading users...
            </div>
          ) : (
            <UsersTable
              users={filteredUsers}
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
