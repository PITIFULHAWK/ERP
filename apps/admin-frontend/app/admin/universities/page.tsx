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

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")


  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getUniversities()
        if (response.success && response.data) {
          setUniversities(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch universities:", error)
        toast({
          title: "Error",
          description: "Failed to load universities",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUniversities()
  }, [])

  const handleExport = () => {
    console.log("Exporting universities...")
  }

  const filteredUniversities = universities.filter((university) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return university.name.toLowerCase().includes(searchLower) || university.uid.toString().includes(searchLower)
  })

  const totalUsers = universities.reduce((sum, univ) => sum + univ.totalUsers, 0)
  const totalCourses = universities.reduce((sum, univ) => sum + univ.totalCourses, 0)
  const totalHostels = universities.reduce((sum, univ) => sum + univ.totalHostels, 0)

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
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hostels</CardTitle>
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
              placeholder="Search by name or UID..."
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
          <h2 className="text-xl font-playfair font-semibold">Universities ({filteredUniversities.length})</h2>
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading universities...
          </div>
        ) : filteredUniversities.length === 0 ? (
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
            {filteredUniversities.map((university) => (
              <UniversityCard key={university.id} university={university} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
