"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { Plus, Download, Eye, Edit2, Trash2, FileText, Video, Image, Link, BarChart3 } from "lucide-react"
import type { Resource, CreateResourceRequest, UpdateResourceRequest, ResourceStats } from "@/types"

const resourceTypeIcons = {
  PDF: FileText,
  VIDEO: Video,
  AUDIO: Video,
  IMAGE: Image,
  DOCUMENT: FileText,
  LINK: Link,
  OTHER: FileText,
}

export function ResourceManagement() {
  const [resources, setResources] = useState<Resource[]>([])
  const [courses, setCourses] = useState<{id: string; name: string}[]>([])
  const [subjects, setSubjects] = useState<{id: string; name: string}[]>([])
  const [semesters, setSemesters] = useState<{id: string; name: string; number: number}[]>([])
  const [stats, setStats] = useState<ResourceStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  
  // Form states
  const [newResource, setNewResource] = useState<CreateResourceRequest>({
    title: "",
    description: "",
    type: "PDF",
    isPublic: true,
  })
  const [editingResource, setEditingResource] = useState<UpdateResourceRequest>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    type: "",
    courseId: "",
    subjectId: "",
    semesterId: "",
    isPublic: "",
    search: "",
  })

  const loadResources = useCallback(async () => {
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== "")
      )
      const response = await apiClient.getResources(activeFilters) as { success: boolean; data: Resource[] }
      if (response.success) {
        setResources(response.data)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load resources",
        variant: "destructive",
      })
    }
  }, [filters])

  useEffect(() => {
    loadResources()
    loadCourses()
    loadSubjects()
    loadSemesters()
    loadStats()
  }, [loadResources])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  const loadCourses = async () => {
    try {
      const response = await apiClient.getCourses() as { success: boolean; data: {id: string; name: string}[] }
      if (response.success) {
        setCourses(response.data)
      }
    } catch {
      console.error("Failed to load courses")
    }
  }

  const loadSubjects = async () => {
    try {
      const response = await apiClient.getSubjects() as { success: boolean; data: {id: string; name: string}[] }
      if (response.success) {
        setSubjects(response.data)
      }
    } catch {
      console.error("Failed to load subjects")
    }
  }

  const loadSemesters = async () => {
    try {
      const response = await apiClient.getSemesters() as { success: boolean; data: {id: string; name: string; number: number}[] }
      if (response.success) {
        setSemesters(response.data)
      }
    } catch {
      console.error("Failed to load semesters")
    }
  }

  const loadStats = async () => {
    try {
      const response = await apiClient.getResourceStats() as { success: boolean; data: ResourceStats }
      if (response.success) {
        setStats(response.data)
      }
    } catch {
      console.error("Failed to load stats")
    }
  }

  const handleCreateResource = async () => {
    if (!newResource.title || !newResource.description) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.createResource(newResource) as { success: boolean; data: { id: string } }
      if (response.success) {
        const resourceId = response.data.id
        
        // Upload file if selected
        if (selectedFile) {
          await apiClient.uploadResourceFile(resourceId, selectedFile)
        }
        
        toast({
          title: "Success",
          description: "Resource created successfully",
        })
        setShowCreateDialog(false)
        setNewResource({ title: "", description: "", type: "PDF", isPublic: true })
        setSelectedFile(null)
        loadResources()
        loadStats()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to create resource",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateResource = async () => {
    if (!selectedResource) return

    setLoading(true)
    try {
      const response = await apiClient.updateResource(selectedResource.id, editingResource) as { success: boolean }
      if (response.success) {
        toast({
          title: "Success",
          description: "Resource updated successfully",
        })
        setShowEditDialog(false)
        setEditingResource({})
        setSelectedResource(null)
        loadResources()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update resource",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return

    setLoading(true)
    try {
      const response = await apiClient.deleteResource(resourceId) as { success: boolean }
      if (response.success) {
        toast({
          title: "Success",
          description: "Resource deleted successfully",
        })
        loadResources()
        loadStats()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadResource = async (resource: Resource) => {
    try {
      const response = await apiClient.downloadResource(resource.id) as { success: boolean; data: { downloadUrl: string } }
      if (response.success) {
        // Create download link
        const link = document.createElement('a')
        link.href = response.data.downloadUrl
        link.download = resource.title
        link.click()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to download resource",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (resource: Resource) => {
    setSelectedResource(resource)
    setEditingResource({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      externalUrl: resource.externalUrl,
      isPublic: resource.isPublic,
      subjectId: resource.subject?.id,
      semesterId: resource.semester?.id,
      courseId: resource.course?.id,
    })
    setShowEditDialog(true)
  }

  const getResourceIcon = (type: string) => {
    const IconComponent = resourceTypeIcons[type as keyof typeof resourceTypeIcons] || FileText
    return <IconComponent className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resource Management</h2>
          <p className="text-muted-foreground">
            Upload, share, and manage educational resources
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
              <DialogDescription>
                Upload or link to an educational resource
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newResource.title}
                    onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Resource title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={newResource.type} onValueChange={(value: "PDF" | "VIDEO" | "AUDIO" | "IMAGE" | "DOCUMENT" | "LINK" | "OTHER") => setNewResource(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF Document</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="AUDIO">Audio</SelectItem>
                      <SelectItem value="IMAGE">Image</SelectItem>
                      <SelectItem value="DOCUMENT">Document</SelectItem>
                      <SelectItem value="LINK">External Link</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newResource.description}
                  onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Resource description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select value={newResource.courseId || ""} onValueChange={(value) => setNewResource(prev => ({ ...prev, courseId: value || undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={newResource.subjectId || ""} onValueChange={(value) => setNewResource(prev => ({ ...prev, subjectId: value || undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select value={newResource.semesterId || ""} onValueChange={(value) => setNewResource(prev => ({ ...prev, semesterId: value || undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {semesters.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id}>
                          Semester {semester.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newResource.type === "LINK" ? (
                <div className="space-y-2">
                  <Label htmlFor="externalUrl">External URL</Label>
                  <Input
                    id="externalUrl"
                    type="url"
                    value={newResource.externalUrl || ""}
                    onChange={(e) => setNewResource(prev => ({ ...prev, externalUrl: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="file">Upload File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3,.jpg,.jpeg,.png,.gif"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={newResource.isPublic}
                  onCheckedChange={(checked) => setNewResource(prev => ({ ...prev, isPublic: !!checked }))}
                />
                <Label htmlFor="isPublic">Make this resource public</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateResource} disabled={loading}>
                {loading ? "Creating..." : "Create Resource"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <Input
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Search resources..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="AUDIO">Audio</SelectItem>
                      <SelectItem value="IMAGE">Image</SelectItem>
                      <SelectItem value="DOCUMENT">Document</SelectItem>
                      <SelectItem value="LINK">Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select value={filters.courseId} onValueChange={(value) => setFilters(prev => ({ ...prev, courseId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Courses</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={filters.subjectId} onValueChange={(value) => setFilters(prev => ({ ...prev, subjectId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select value={filters.isPublic} onValueChange={(value) => setFilters(prev => ({ ...prev, isPublic: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="true">Public</SelectItem>
                      <SelectItem value="false">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ type: "", courseId: "", subjectId: "", semesterId: "", isPublic: "", search: "" })}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources List */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>
                {resources.length} resource(s) found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Course/Subject</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getResourceIcon(resource.type)}
                            <div>
                              <div>{resource.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {resource.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{resource.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {resource.course && <div>{resource.course.name}</div>}
                            {resource.subject && <div className="text-muted-foreground">{resource.subject.name}</div>}
                            {!resource.course && !resource.subject && <span className="text-muted-foreground">General</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{resource.uploadedBy.firstName} {resource.uploadedBy.lastName}</div>
                            <div className="text-muted-foreground">{resource.uploadedBy.role}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{resource.downloads} downloads</div>
                            <div className="text-muted-foreground">{resource.views} views</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={resource.isPublic ? "default" : "secondary"}>
                            {resource.isPublic ? "Public" : "Private"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {resource.fileUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadResource(resource)}
                                className="flex items-center gap-1"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </Button>
                            )}
                            {resource.externalUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(resource.externalUrl, '_blank')}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(resource)}
                              className="flex items-center gap-1"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteResource(resource.id)}
                              className="flex items-center gap-1 text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resource Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{stats.totalResources}</div>
                      <div className="text-sm text-muted-foreground">Total Resources</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{stats.totalDownloads}</div>
                      <div className="text-sm text-muted-foreground">Total Downloads</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{stats.totalViews}</div>
                      <div className="text-sm text-muted-foreground">Total Views</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Resources by Type</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {stats.resourcesByType.map((item) => (
                        <div key={item.type} className="text-center p-4 border rounded-lg">
                          <div className="flex items-center justify-center mb-2">
                            {getResourceIcon(item.type)}
                          </div>
                          <div className="font-semibold">{item.count}</div>
                          <div className="text-sm text-muted-foreground">{item.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Loading analytics...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Resource Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>
              Update resource information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingResource.title || ""}
                  onChange={(e) => setEditingResource(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select value={editingResource.type} onValueChange={(value: "PDF" | "VIDEO" | "AUDIO" | "IMAGE" | "DOCUMENT" | "LINK" | "OTHER") => setEditingResource(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF Document</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                    <SelectItem value="AUDIO">Audio</SelectItem>
                    <SelectItem value="IMAGE">Image</SelectItem>
                    <SelectItem value="DOCUMENT">Document</SelectItem>
                    <SelectItem value="LINK">External Link</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editingResource.description || ""}
                onChange={(e) => setEditingResource(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {editingResource.type === "LINK" && (
              <div className="space-y-2">
                <Label htmlFor="edit-externalUrl">External URL</Label>
                <Input
                  id="edit-externalUrl"
                  type="url"
                  value={editingResource.externalUrl || ""}
                  onChange={(e) => setEditingResource(prev => ({ ...prev, externalUrl: e.target.value }))}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isPublic"
                checked={editingResource.isPublic}
                onCheckedChange={(checked) => setEditingResource(prev => ({ ...prev, isPublic: !!checked }))}
              />
              <Label htmlFor="edit-isPublic">Make this resource public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateResource} disabled={loading}>
              {loading ? "Updating..." : "Update Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
