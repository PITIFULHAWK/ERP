"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserRoleBadge } from "./user-role-badge"
import { UserStatusBadge } from "./user-status-badge"
import { Eye, MoreHorizontal, UserCheck, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { User } from "@/types/user"

interface UsersTableProps {
  users: User[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onBulkAction: (action: string, ids: string[]) => void
}

export function UsersTable({ users, selectedIds, onSelectionChange, onBulkAction }: UsersTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(users.map((user) => user.id))
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

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedIds.length} users selected</span>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={() => onBulkAction("verify", selectedIds)}>
              <UserCheck className="w-4 h-4 mr-1" />
              Bulk Verify
            </Button>
            <Button size="sm" variant="outline" onClick={() => onBulkAction("promote", selectedIds)}>
              <UserCheck className="w-4 h-4 mr-1" />
              Promote to Student
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onBulkAction("delete", selectedIds)}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
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
                  checked={selectedIds.length === users.length && users.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>University</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(user.id)}
                    onCheckedChange={(checked) => handleSelectOne(user.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <UserRoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  <UserStatusBadge status={user.userStatus} />
                </TableCell>
                <TableCell>
                  <div className="text-sm">{user.university.name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{formatDate(user.createdAt)}</div>
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
                        <Link href={`/admin/users/${user.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                      {user.userStatus === "NOT_VERIFIED" && (
                        <DropdownMenuItem onClick={() => onBulkAction("verify", [user.id])}>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Verify User
                        </DropdownMenuItem>
                      )}
                      {user.role === "USER" && (
                        <DropdownMenuItem onClick={() => onBulkAction("promote", [user.id])}>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Promote to Student
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive" onClick={() => onBulkAction("delete", [user.id])}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
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
