"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem,SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Plus, Search, Calendar, Edit, Trash2} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import type { CreateNoticeRequest, UpdateNoticeRequest } from "@/types"

interface Notice {
  id: string
  title: string
  content: string
  type: "GENERAL" | "URGENT" | "ACADEMIC" | "HOSTEL" | "EXAM"
  priority: "LOW" | "MEDIUM" | "HIGH"
  targetAudience: "ALL" | "STUDENTS" | "FACULTY" | "STAFF"
  publishedAt: string
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [universityId, setUniversityId] = useState<string>("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState<Notice["type"] | undefined>(undefined)
  const [priority, setPriority] = useState<Notice["priority"] | undefined>(undefined)
  const [targetAudience, setTargetAudience] = useState<Notice["targetAudience"] | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true)
        const response = (await apiClient.getNotices()) as {
          success: boolean
          data?: Notice[]
          message?: string
        }
        if (response.success && response.data) {
          setNotices(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch notices:", error)
        toast({
          title: "Error",
          description: "Failed to load notices",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchUniversityId = async () => {
      try {
        const uniResp = (await apiClient.getUniversities()) as {
          success: boolean
          data?: Array<{ id: string }>
          message?: string
        }
        if (uniResp.success && uniResp.data && uniResp.data.length > 0) {
          setUniversityId(uniResp.data[0].id)
        }
      } catch (error) {
        console.error("Failed to fetch university:", error)
      }
    }

    fetchNotices()
    fetchUniversityId()
  }, [])

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || notice.type === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case "URGENT":
        return "bg-red-100 text-red-800"
      case "ACADEMIC":
        return "bg-blue-100 text-blue-800"
      case "HOSTEL":
        return "bg-green-100 text-green-800"
      case "EXAM":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "LOW":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  async function handleCreateNotice() {
    try {
      if (!universityId) {
        toast({
          title: "Missing university",
          description: "University is not configured.",
          variant: "destructive",
        })
        return
      }
      if (!title.trim() || !content.trim()) {
        toast({
          title: "Missing fields",
          description: "Please provide both title and content.",
          variant: "destructive",
        })
        return
      }

      setIsSubmitting(true)

      const payload: CreateNoticeRequest = {
        title: title.trim(),
        content: content.trim(),
        universityId,
        ...(type ? { type } : {}),
        ...(priority ? { priority } : {}),
        ...(targetAudience ? { targetAudience } : {}),
      }

      const response = (await apiClient.createNotice(payload)) as {
        success: boolean
        data?: Notice
        message?: string
      }

      if (response?.success && response.data) {
        const created = response.data
        setNotices((prev) => [created, ...prev])
        setIsCreateDialogOpen(false)
        setTitle("")
        setContent("")
        setType(undefined)
        setPriority(undefined)
        setTargetAudience(undefined)
        toast({
          title: "Notice created",
          description: "The notice has been created successfully.",
        })
      } else {
        throw new Error(response?.message || "Failed to create notice")
      }
    } catch (error: unknown) {
      console.error("Failed to create notice:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create notice",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notice Management</h1>
          <p className="text-muted-foreground">Create and manage university notices and announcements</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Notice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Notice</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                void handleCreateNotice()
              }}
            >
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="Enter notice title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea placeholder="Enter notice content" rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={type} onValueChange={(v) => setType(v as Notice["type"])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                      <SelectItem value="ACADEMIC">Academic</SelectItem>
                      <SelectItem value="HOSTEL">Hostel</SelectItem>
                      <SelectItem value="EXAM">Exam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as Notice["priority"])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <Select value={targetAudience} onValueChange={(v) => setTargetAudience(v as Notice["targetAudience"])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="STUDENTS">Students</SelectItem>
                      <SelectItem value="FACULTY">Faculty</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Notice"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setEditingNotice(null) }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Notice</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                if (!editingNotice) return
                try {
                  setIsSubmitting(true)
                  const payload: UpdateNoticeRequest = {
                    title: title.trim(),
                    content: content.trim(),
                    ...(type ? { type } : {}),
                    ...(priority ? { priority } : {}),
                    ...(targetAudience ? { targetAudience } : {}),
                  }
                  const resp = (await apiClient.updateNotice(editingNotice.id, payload)) as { success: boolean; data?: Notice; message?: string }
                  if (resp.success && resp.data) {
                    setNotices((prev) => prev.map((n) => (n.id === editingNotice.id ? resp.data! : n)))
                    toast({ title: "Updated", description: "Notice updated successfully." })
                    setIsEditDialogOpen(false)
                    setEditingNotice(null)
                  } else {
                    throw new Error(resp.message || "Failed to update notice")
                  }
                } catch (err: unknown) {
                  toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to update notice", variant: "destructive" })
                } finally {
                  setIsSubmitting(false)
                }
              }}
            >
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="Enter notice title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea placeholder="Enter notice content" rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={type} onValueChange={(v) => setType(v as Notice["type"])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                      <SelectItem value="ACADEMIC">Academic</SelectItem>
                      <SelectItem value="HOSTEL">Hostel</SelectItem>
                      <SelectItem value="EXAM">Exam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as Notice["priority"])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <Select value={targetAudience} onValueChange={(v) => setTargetAudience(v as Notice["targetAudience"])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="STUDENTS">Students</SelectItem>
                      <SelectItem value="FACULTY">Faculty</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingNotice(null) }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : notices.length}</div>
          </CardContent>
        </Card>
        
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search notices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Notice Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="GENERAL">General</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="ACADEMIC">Academic</SelectItem>
                <SelectItem value="HOSTEL">Hostel</SelectItem>
                <SelectItem value="EXAM">Exam</SelectItem>
              </SelectContent>
            </Select>
            
          </div>
        </CardContent>
      </Card>

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.map((notice) => (
          <Card key={notice.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{notice.title}</h3>
                    <Badge className={getTypeColor(notice.type)}>{notice.type}</Badge>
                    <Badge className={getPriorityColor(notice.priority)}>{notice.priority}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-3 line-clamp-2">{notice.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(notice.publishedAt).toLocaleDateString()}
                    </div>
                    <div>Target: {notice.targetAudience}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingNotice(notice)
                      setTitle(notice.title)
                      setContent(notice.content)
                      setType(notice.type)
                      setPriority(notice.priority)
                      setTargetAudience(notice.targetAudience)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const confirmed = window.confirm("Are you sure you want to delete this notice?")
                      if (!confirmed) return
                      try {
                        const resp = (await apiClient.deleteNotice(notice.id)) as { success: boolean; message?: string }
                        if (resp.success) {
                          setNotices((prev) => prev.filter((n) => n.id !== notice.id))
                          toast({ title: "Deleted", description: "Notice deleted successfully." })
                        } else {
                          throw new Error(resp.message || "Failed to delete notice")
                        }
                      } catch (err: unknown) {
                        toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to delete notice", variant: "destructive" })
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
