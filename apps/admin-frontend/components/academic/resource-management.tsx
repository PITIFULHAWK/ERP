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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
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
  const { user } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [subjects, setSubjects] = useState<{id: string; name: string}[]>([])
  const [sections, setSections] = useState<{id: string; name: string; code: string; course: {name: string}}[]>([])
  const [stats, setStats] = useState<ResourceStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  
  // Form states
  const [newResource, setNewResource] = useState<CreateResourceRequest>({
    title: "",
    description: "",
    type: "PDF",
  })
  const [editingResource, setEditingResource] = useState<UpdateResourceRequest>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    type: "all",
    sectionId: "all",
    subjectId: "all",
    isPublic: "all",
    search: "",
  })

  const loadResources = useCallback(async () => {
    if (!user?.id) return
    
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== "" && value !== "all" && value !== "none")
      )
      const response = await apiClient.getResourcesForProfessor(user.id, activeFilters) as { success: boolean; data: Resource[] }
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
  }, [filters, user?.id])

  const loadSubjects = useCallback(async () => {
    try {
      if (user?.role === "PROFESSOR") {
        // For professors, load only subjects they teach
        const response = await apiClient.getProfessorSections(user.id) as {
          success: boolean
          data: Array<{
            id: string
            professorId: string
            sectionId: string
            subjectId: string
            isActive: boolean
            subject: {
              id: string
              name: string
              code: string
            }
          }>
        }
        
        if (response.success && response.data) {
          // Extract unique subjects from professor assignments
          const uniqueSubjects = response.data
            .filter(assignment => assignment.subject && assignment.isActive)
            .reduce((acc, assignment) => {
              const subjectKey = assignment.subject.id
              if (!acc.some(s => s.id === subjectKey)) {
                acc.push({
                  id: assignment.subject.id,
                  name: assignment.subject.name
                })
              }
              return acc
            }, [] as {id: string; name: string}[])
          
          setSubjects(uniqueSubjects)
        }
      } else {
        // For admins, load all subjects
        const response = await apiClient.getSubjects() as { success: boolean; data: {id: string; name: string}[] }
        if (response.success) {
          setSubjects(response.data)
        }
      }
    } catch {
      console.error("Failed to load subjects")
    }
  }, [user?.role, user?.id])

  const loadSections = useCallback(async () => {
    try {
      if (user?.role === "PROFESSOR") {
        // For professors, load only sections they teach
        const response = await apiClient.getProfessorSections(user.id) as {
          success: boolean
          data: Array<{
            id: string
            professorId: string
            sectionId: string
            subjectId: string
            isActive: boolean
            section: {
              id: string
              name: string
              code: string
              course: {
                id: string
                name: string
                code: string
              }
            }
          }>
        }
        
        if (response.success && response.data) {
          // Extract unique sections from professor assignments
          const uniqueSections = response.data
            .filter(assignment => assignment.section && assignment.isActive)
            .reduce((acc, assignment) => {
              const sectionKey = assignment.section.id
              if (!acc.some(s => s.id === sectionKey)) {
                acc.push({
                  id: assignment.section.id,
                  name: assignment.section.name,
                  code: assignment.section.code,
                  course: { name: assignment.section.course.name }
                })
              }
              return acc
            }, [] as {id: string; name: string; code: string; course: {name: string}}[])
          
          setSections(uniqueSections)
        }
      } else {
        // For admins, load all sections
        const response = await apiClient.getSections() as { success: boolean; data: {id: string; name: string; code: string; course: {name: string}}[] }
        if (response.success) {
          setSections(response.data)
        }
      }
    } catch {
      console.error("Failed to load sections")
    }
  }, [user?.role, user?.id])

  const loadStats = useCallback(async () => {
    if (!user?.id) return
    
    try {
      const response = await apiClient.getResourceStats(user.id) as { success: boolean; data: ResourceStats }
      if (response.success) {
        setStats(response.data)
      }
    } catch {
      console.error("Failed to load stats")
    }
  }, [user?.id])

  useEffect(() => {
    loadResources()
    loadSubjects()
    loadSections()
    loadStats()
  }, [loadResources, loadSubjects, loadSections, loadStats])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  const handleCreateResource = async () => {
    if (!newResource.title || !newResource.description || !newResource.sectionId || !user?.id) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const resourceData = {
        professorId: user.id,
        sectionId: newResource.sectionId,
        subjectId: newResource.subjectId,
        title: newResource.title,
        description: newResource.description,
        resourceType: newResource.type
      }
      
      const response = await apiClient.shareResource(resourceData, selectedFile || undefined) as { success: boolean; data: { id: string } }
      if (response.success) {
        toast({
          title: "Success",
          description: "Resource created successfully",
        })
        setShowCreateDialog(false)
        setNewResource({ title: "", description: "", type: "PDF" })
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
    if (!user?.id) return

    setLoading(true)
    try {
      const response = await apiClient.deleteResource(resourceId, user.id) as { success: boolean }
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
      // Track the download
      await apiClient.trackResourceDownload(resource.id)
      
      // Direct download using the file URL
      if (resource.fileUrl) {
        const link = document.createElement('a')
        link.href = resource.fileUrl
        link.download = resource.title
        link.target = '_blank'
        link.click()
      } else {
        toast({
          title: "Error",
          description: "No file available for download",
          variant: "destructive",
        })
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
      subjectId: resource.subject?.id,
      sectionId: resource.section?.id,
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

              <div className="space-y-2">
                <Label>Section</Label>
                <Select value={newResource.sectionId || "none"} onValueChange={(value) => setNewResource(prev => ({ ...prev, sectionId: value === "none" ? undefined : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name} ({section.code}) - {section.course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject (Optional)</Label>
                <Select value={newResource.subjectId || "none"} onValueChange={(value) => setNewResource(prev => ({ ...prev, subjectId: value === "none" ? undefined : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                      <SelectItem value="all">All Types</SelectItem>
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
                  <Label>Section</Label>
                  <Select value={filters.sectionId || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, sectionId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name} ({section.code}) - {section.course.name}
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
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.isPublic} onValueChange={(value) => setFilters(prev => ({ ...prev, isPublic: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Visible</SelectItem>
                      <SelectItem value="false">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ type: "all", sectionId: "all", subjectId: "all", isPublic: "all", search: "" })}
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
                      <TableHead>Section/Subject</TableHead>
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
                            {resource.section && <div>{resource.section.name} ({resource.section.code})</div>}
                            {resource.subject && <div className="text-muted-foreground">{resource.subject.name}</div>}
                            {!resource.section && !resource.subject && <span className="text-muted-foreground">General</span>}
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
                      <div className="text-2xl font-bold">{stats.totalResources || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Resources</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{stats.totalDownloads || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Downloads</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{stats.totalViews || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Views</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Resources by Type</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {stats.resourcesByType && stats.resourcesByType.length > 0 ? (
                        stats.resourcesByType.map((item) => (
                          <div key={item.type} className="text-center p-4 border rounded-lg">
                            <div className="flex items-center justify-center mb-2">
                              {getResourceIcon(item.type)}
                            </div>
                            <div className="font-semibold">{item.count}</div>
                            <div className="text-sm text-muted-foreground">{item.type}</div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-4 text-muted-foreground">
                          No resource type data available
                        </div>
                      )}
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

            <div className="space-y-2">
              <Label>Section</Label>
              <Select value={editingResource.sectionId || "none"} onValueChange={(value) => setEditingResource(prev => ({ ...prev, sectionId: value === "none" ? undefined : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name} ({section.code}) - {section.course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject (Optional)</Label>
              <Select value={editingResource.subjectId || "none"} onValueChange={(value) => setEditingResource(prev => ({ ...prev, subjectId: value === "none" ? undefined : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
