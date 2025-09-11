"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UniversityCard } from "@/components/universities/university-card"
import { Download, RefreshCw, Building2, Search } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import type { University } from "@/types/university"
import type { User } from "@/types/user"

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [totalUsersCount, setTotalUsersCount] = useState(0)


  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch universities and users in parallel
      const [universitiesResponse, usersResponse] = await Promise.all([
        apiClient.getUniversities() as Promise<{ success: boolean; data: University[] }>,
        apiClient.getUsers() as Promise<{ success: boolean; data: User[] }>
      ])
      
      // Handle universities response
      if (universitiesResponse.success && universitiesResponse.data) {
        setUniversities(universitiesResponse.data)
      } else if (universitiesResponse && Array.isArray(universitiesResponse)) {
        setUniversities(universitiesResponse)
      } else {
        console.error("Unexpected universities response format:", universitiesResponse)
      }
      
      // Handle users response
      if (usersResponse.success && usersResponse.data) {
        setTotalUsersCount(usersResponse.data.length)
      } else if (usersResponse && Array.isArray(usersResponse)) {
        setTotalUsersCount(usersResponse.length)
      } else {
        console.error("Unexpected users response format:", usersResponse)
        setTotalUsersCount(0)
        // Don't show error toast for users if universities loaded successfully
        if (!universitiesResponse.success && !Array.isArray(universitiesResponse)) {
          toast({
            title: "Warning", 
            description: "Could not load user count",
            variant: "destructive",
          })
        }
      }
      
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast({
        title: "Error",
        description: "Failed to load universities and user data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleExport = () => {
    console.log("Exporting universities...")
  }

  const filteredUniversities = universities.filter((university) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return university.name.toLowerCase().includes(searchLower) || 
           university.location.toLowerCase().includes(searchLower) ||
           university.id.toLowerCase().includes(searchLower)
  })

  // Add calculated properties to universities for the card component
  const universitiesWithStats = filteredUniversities.map(university => ({
    ...university,
    totalUsers: Array.isArray(university.users) ? university.users.length : 0,
    totalCourses: Array.isArray(university.courses) ? university.courses.length : 0,
    totalHostels: Array.isArray(university.hostels) ? university.hostels.length : 0,
  }))

  const totalUsers = totalUsersCount
  const totalCourses = universities.reduce((sum, univ) => sum + (Array.isArray(univ.courses) ? univ.courses.length : 0), 0)
  const totalHostels = universities.reduce((sum, univ) => sum + (Array.isArray(univ.hostels) ? univ.hostels.length : 0), 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold">Universities</h1>
          <p className="text-muted-foreground">Manage educational institutions in the system</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/admin/universities/create">
              <Building2 className="w-4 h-4 mr-2" />
              Add University
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Universities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{universities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users (System-wide)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses (All Universities)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hostels (All Universities)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{totalHostels}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-playfair">Search Universities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, location, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Universities Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-playfair font-semibold">Universities ({universitiesWithStats.length})</h2>
          <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading universities...
          </div>
        ) : universitiesWithStats.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Universities Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No universities match your search criteria." : "No universities have been added yet."}
              </p>
              <Button asChild>
                <Link href="/admin/universities/create">
                  <Building2 className="w-4 h-4 mr-2" />
                  Add First University
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universitiesWithStats.map((university) => (
              <UniversityCard key={university.id} university={university} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
