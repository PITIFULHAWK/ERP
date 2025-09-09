"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, X } from "lucide-react"
import type { CourseFilters } from "@/types/course"

interface CourseFiltersProps {
  filters: CourseFilters
  onFiltersChange: (filters: CourseFilters) => void
  onClearFilters: () => void
}

export function CourseFiltersComponent({ filters, onFiltersChange, onClearFilters }: CourseFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof CourseFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    })
  }

  const hasActiveFilters = Object.values(filters).some((value) => value && value !== "")

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-playfair">Filters</CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              <Filter className="w-4 h-4 mr-1" />
              {isExpanded ? "Less" : "More"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by course name or code..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="university">University</Label>
            <Select
              value={filters.universityId || "ALL_UNIVERSITIES"}
              onValueChange={(value) => handleFilterChange("universityId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All universities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_UNIVERSITIES">All universities</SelectItem>
                <SelectItem value="univ-1">Indian Institute of Technology</SelectItem>
                <SelectItem value="univ-2">Delhi University</SelectItem>
                <SelectItem value="univ-3">Mumbai University</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isExpanded && (
            <>
              <div>
                <Label htmlFor="sortBy">Sort By</Label>
                <Select value={filters.sortBy || "name"} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Course Name</SelectItem>
                    <SelectItem value="code">Course Code</SelectItem>
                    <SelectItem value="currentStudents">Enrollment</SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sortOrder">Order</Label>
                <Select
                  value={filters.sortOrder || "asc"}
                  onValueChange={(value) => handleFilterChange("sortOrder", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
