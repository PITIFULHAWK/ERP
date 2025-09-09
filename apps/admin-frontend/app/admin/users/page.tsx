"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserFiltersComponent } from "@/components/users/user-filters"
import { UsersTable } from "@/components/users/users-table"
import { Download, RefreshCw, UserPlus } from "lucide-react"
import Link from "next/link"
import type { User, UserFilters } from "@/types/user"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filters, setFilters] = useState<UserFilters>({})

  // Mock data for demonstration
  const mockUsers: User[] = [
    {
      id: "1",
      name: "John Admin",
      email: "john.admin@iit.edu",
      role: "ADMIN",
      userStatus: "VERIFIED",
      universityId: "univ-1",
      university: {
        id: "univ-1",
        name: "Indian Institute of Technology",
        uid: 12345,
      },
      createdAt: "2024-01-10T10:30:00Z",
      updatedAt: "2024-01-10T10:30:00Z",
    },
    {
      id: "2",
      name: "Sarah Verifier",
      email: "sarah.verifier@iit.edu",
      role: "VERIFIER",
      userStatus: "VERIFIED",
      universityId: "univ-1",
      university: {
        id: "univ-1",
        name: "Indian Institute of Technology",
        uid: 12345,
      },
      createdAt: "2024-01-12T14:20:00Z",
      updatedAt: "2024-01-12T14:20:00Z",
    },
    {
      id: "3",
      name: "Dr. Michael Professor",
      email: "michael.prof@du.edu",
      role: "PROFESSOR",
      userStatus: "VERIFIED",
      universityId: "univ-2",
      university: {
        id: "univ-2",
        name: "Delhi University",
        uid: 67890,
      },
      createdAt: "2024-01-08T09:15:00Z",
      updatedAt: "2024-01-08T09:15:00Z",
    },
    {
      id: "4",
      name: "Emily Student",
      email: "emily.student@iit.edu",
      role: "STUDENT",
      userStatus: "VERIFIED",
      universityId: "univ-1",
      university: {
        id: "univ-1",
        name: "Indian Institute of Technology",
        uid: 12345,
      },
      createdAt: "2024-01-15T16:45:00Z",
      updatedAt: "2024-01-15T16:45:00Z",
    },
    {
      id: "5",
      name: "David User",
      email: "david.user@gmail.com",
      role: "USER",
      userStatus: "NOT_VERIFIED",
      universityId: "univ-1",
      university: {
        id: "univ-1",
        name: "Indian Institute of Technology",
        uid: 12345,
      },
      createdAt: "2024-01-18T11:30:00Z",
      updatedAt: "2024-01-18T11:30:00Z",
    },
  ]

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        // In a real app: const response = await apiClient.getUsers(filters)
        setTimeout(() => {
          setUsers(mockUsers)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch users:", error)
        setLoading(false)
      }
    }

    fetchUsers()
  }, [filters])

  const handleBulkAction = async (action: string, ids: string[]) => {
    try {
      console.log(`Performing ${action} on users:`, ids)
      // In a real app, implement bulk actions here
      setSelectedIds([])
    } catch (error) {
      console.error("Bulk action failed:", error)
    }
  }

  const handleExport = () => {
    console.log("Exporting users...")
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
          <Button asChild>
            <Link href="/admin/users/create">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Link>
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
