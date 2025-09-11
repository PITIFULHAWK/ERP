"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import type { PaymentFilters } from "@/types"

interface PaymentFiltersProps {
  filters: PaymentFilters
  onFiltersChange: (filters: PaymentFilters) => void
  onClearFilters: () => void
}

export function PaymentFiltersComponent({ filters, onFiltersChange, onClearFilters }: PaymentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof PaymentFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    })
  }

  const activeFiltersCount = Object.values(filters).filter(value => value !== undefined && value !== "").length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user name, email, or reference..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => handleFilterChange("status", value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.type || "all"}
              onValueChange={(value) => handleFilterChange("type", value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="COURSE">Course Fees</SelectItem>
                <SelectItem value="HOSTEL">Hostel Fees</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.method || "all"}
              onValueChange={(value) => handleFilterChange("method", value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="MANUAL">Manual</SelectItem>
                <SelectItem value="RAZORPAY">Razorpay</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">Created After</label>
                <Input
                  type="date"
                  value={filters.createdAfter || ""}
                  onChange={(e) => handleFilterChange("createdAfter", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Created Before</label>
                <Input
                  type="date"
                  value={filters.createdBefore || ""}
                  onChange={(e) => handleFilterChange("createdBefore", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select
                  value={filters.sortBy || ""}
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Sort Order</label>
                <Select
                  value={filters.sortOrder || ""}
                  onValueChange={(value) => handleFilterChange("sortOrder", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
