"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ApplicationStatusBadge } from "./application-status-badge"
import { Eye, MoreHorizontal, CheckCircle, XCircle, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Application } from "@/types/application"

interface ApplicationsTableProps {
  applications: Application[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onBulkAction: (action: string, ids: string[]) => void
  isLoading?: boolean
}

export function ApplicationsTable({
  applications,
  selectedIds,
  onSelectionChange,
  onBulkAction,
  isLoading = false,
}: ApplicationsTableProps) {
  const [sortField, setSortField] = useState<keyof Application>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(applications.map((app) => app.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id])
    } else {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const sortedApplications = [...applications].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    // Handle undefined values
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return 1
    if (bValue == null) return -1

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedIds.length} applications selected</span>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={() => onBulkAction("approve", selectedIds)} disabled={isLoading}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Bulk Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => onBulkAction("reject", selectedIds)} disabled={isLoading}>
              <XCircle className="w-4 h-4 mr-1" />
              Bulk Reject
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === applications.length && applications.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>University</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Academic Score</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedApplications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(application.id)}
                    onCheckedChange={(checked) => handleSelectOne(application.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {application.firstName} {application.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">{application.user?.email || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">{application.phoneNumber}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{application.preferredCourse?.name || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">{application.preferredCourse?.code || "N/A"}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{application.preferredCourse?.university?.name || "N/A"}</div>
                </TableCell>
                <TableCell>
                  <ApplicationStatusBadge status={application.status} />
                </TableCell>
                <TableCell>
                  <div className="text-sm">{formatDate(application.createdAt)}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>Class 12: {application.class12Percentage}%</div>
                    {application.hasJeeMainsScore && (
                      <div className="text-muted-foreground">JEE: {application.jeeMainsScore}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/applications/${application.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {application.status === "PENDING" && (
                        <>
                          <DropdownMenuItem onClick={() => onBulkAction("review", [application.id])} disabled={isLoading}>
                            <Clock className="w-4 h-4 mr-2" />
                            Start Review
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onBulkAction("approve", [application.id])} disabled={isLoading}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onBulkAction("reject", [application.id])} disabled={isLoading}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      {application.status === "UNDER_REVIEW" && (
                        <>
                          <DropdownMenuItem onClick={() => onBulkAction("approve", [application.id])} disabled={isLoading}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onBulkAction("reject", [application.id])} disabled={isLoading}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
