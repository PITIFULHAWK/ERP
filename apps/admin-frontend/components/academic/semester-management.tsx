"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, BookOpen } from "lucide-react"
import type { Semester } from "@/types/course"

interface SemesterManagementProps {
  courseId: string
  semesters: Semester[]
  onCreateSemester: (data: { name: string; number: number }) => void
  onUpdateSemester: (id: string, data: { name: string; number: number }) => void
  onDeleteSemester: (id: string) => void
}

export function SemesterManagement({
  courseId,
  semesters,
  onCreateSemester,
  onUpdateSemester,
  onDeleteSemester,
}: SemesterManagementProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null)
  const [formData, setFormData] = useState({ name: "", number: 1 })

  const handleCreate = () => {
    onCreateSemester(formData)
    setFormData({ name: "", number: 1 })
    setIsCreateOpen(false)
  }

  const handleUpdate = () => {
    if (editingSemester) {
      onUpdateSemester(editingSemester.id, formData)
      setEditingSemester(null)
      setFormData({ name: "", number: 1 })
    }
  }

  const openEditDialog = (semester: Semester) => {
    setEditingSemester(semester)
    setFormData({ name: semester.name, number: semester.number })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-playfair">Semester Management</CardTitle>
            <CardDescription>Manage semesters for this course</CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Semester
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Semester</DialogTitle>
                <DialogDescription>Add a new semester to the course curriculum.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="semesterName">Semester Name</Label>
                  <Input
                    id="semesterName"
                    placeholder="e.g., First Semester"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="semesterNumber">Semester Number</Label>
                  <Input
                    id="semesterNumber"
                    type="number"
                    min="1"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: Number.parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create Semester</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {semesters.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Semesters</h3>
            <p className="text-muted-foreground mb-4">Start by adding the first semester to this course.</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Semester
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semester</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semesters
                .sort((a, b) => a.number - b.number)
                .map((semester) => (
                  <TableRow key={semester.id}>
                    <TableCell>
                      <div className="font-medium">{semester.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{semester.number}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{semester.subjects?.length || 0} subjects</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(semester.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(semester)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDeleteSemester(semester.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingSemester} onOpenChange={() => setEditingSemester(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Semester</DialogTitle>
              <DialogDescription>Update semester information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editSemesterName">Semester Name</Label>
                <Input
                  id="editSemesterName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editSemesterNumber">Semester Number</Label>
                <Input
                  id="editSemesterNumber"
                  type="number"
                  min="1"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: Number.parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSemester(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Update Semester</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
