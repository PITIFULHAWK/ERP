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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { format } from "date-fns"
import { MessageSquare, AlertTriangle, Clock, CheckCircle, XCircle, User, BarChart3, Eye } from "lucide-react"
import type { Complaint, ComplaintStats, UpdateComplaintStatusRequest, AddComplaintUpdateRequest } from "@/types"

const categoryColors = {
  ACADEMIC: "blue",
  INFRASTRUCTURE: "orange",
  HOSTEL: "green",
  FOOD: "yellow",
  TRANSPORT: "purple",
  TECHNICAL: "red",
  ADMINISTRATIVE: "gray",
  LIBRARY: "indigo",
  SPORTS: "teal",
  MEDICAL: "pink",
  FINANCIAL: "cyan",
  OTHER: "slate",
}

const statusColors = {
  OPEN: "blue",
  ASSIGNED: "yellow",
  IN_PROGRESS: "orange",
  RESOLVED: "green",
  CLOSED: "gray",
  REJECTED: "red",
}

const priorityColors = {
  LOW: "green",
  MEDIUM: "yellow",
  HIGH: "orange",
  URGENT: "red",
}

export function ComplaintManagement() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [users, setUsers] = useState<{id: string; firstName: string; lastName: string}[]>([])
  const [stats, setStats] = useState<ComplaintStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  
  // Form states
  const [statusUpdate, setStatusUpdate] = useState<UpdateComplaintStatusRequest>({
    status: "OPEN",
  })
  const [newUpdate, setNewUpdate] = useState<AddComplaintUpdateRequest>({
    message: "",
    isInternal: false,
  })

  const [showDetailsSheet, setShowDetailsSheet] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    priority: "all",
    assignedToId: "unassigned",
    search: "",
  })

  const loadComplaints = useCallback(async () => {
    setLoading(true)
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => {
          if (key === "search") return value !== ""
          return value !== "all" && value !== "unassigned"
        })
      )
      const response = await apiClient.getComplaints(activeFilters) as { success: boolean; data: Complaint[] }
      if (response.success && response.data) {
        setComplaints(Array.isArray(response.data) ? response.data : [])
      } else {
        setComplaints([])
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load complaints",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filters])

  const loadUsers = useCallback(async () => {
    try {
      const response = await apiClient.getUsers({ role: "ADMIN" }) as { success: boolean; data: {id: string; firstName: string; lastName: string}[] }
      if (response.success && response.data) {
        setUsers(Array.isArray(response.data) ? response.data : [])
      } else {
        setUsers([])
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const response = await apiClient.getComplaintStats() as { success: boolean; data: ComplaintStats }
      if (response.success && response.data) {
        setStats(response.data)
      } else {
        setStats(null)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load stats",
        variant: "destructive",
      })
    }
  }, [])

  useEffect(() => {
    loadComplaints()
    loadUsers()
    loadStats()
  }, [loadComplaints, loadUsers, loadStats])

  useEffect(() => {
    loadComplaints()
  }, [loadComplaints])

  const handleStatusUpdate = async () => {
    if (!selectedComplaint) return

    setLoading(true)
    try {
      const response = await apiClient.updateComplaintStatus(selectedComplaint.id, statusUpdate) as { success: boolean }
      if (response.success) {
        toast({
          title: "Success",
          description: "Complaint status updated successfully",
        })
        setShowStatusDialog(false)
        setStatusUpdate({ status: "OPEN" })
        loadComplaints()
        loadStats()
        
        // Update selected complaint if details sheet is open
        if (showDetailsSheet) {
          const updatedResponse = await apiClient.getComplaint(selectedComplaint.id) as { success: boolean; data: Complaint }
          if (updatedResponse.success) {
            setSelectedComplaint(updatedResponse.data)
          }
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update complaint status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddUpdate = async () => {
    if (!selectedComplaint || !newUpdate.message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.addComplaintUpdate(selectedComplaint.id, newUpdate) as { success: boolean }
      if (response.success) {
        toast({
          title: "Success",
          description: "Update added successfully",
        })
        setNewUpdate({ message: "", isInternal: false })
        
        // Refresh complaint details
        const updatedResponse = await apiClient.getComplaint(selectedComplaint.id) as { success: boolean; data: Complaint }
        if (updatedResponse.success) {
          setSelectedComplaint(updatedResponse.data)
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to add update",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComplaint = async (complaintId: string) => {
    if (!confirm("Are you sure you want to delete this complaint?")) return

    setLoading(true)
    try {
      const response = await apiClient.deleteComplaint(complaintId) as { success: boolean }
      if (response.success) {
        toast({
          title: "Success",
          description: "Complaint deleted successfully",
        })
        loadComplaints()
        loadStats()
        if (selectedComplaint?.id === complaintId) {
          setShowDetailsSheet(false)
          setSelectedComplaint(null)
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete complaint",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const openStatusDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setStatusUpdate({
      status: complaint.status,
      assignedToId: complaint.assignedToId,
      resolutionNotes: complaint.resolutionNotes,
    })
    setShowStatusDialog(true)
  }

  const viewComplaintDetails = async (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setShowDetailsSheet(true)
    
    // Load fresh complaint data with updates
    try {
      const response = await apiClient.getComplaint(complaint.id) as { success: boolean; data: Complaint }
      if (response.success) {
        setSelectedComplaint(response.data)
      }
    } catch {
      console.error("Failed to load complaint details")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <AlertTriangle className="h-4 w-4" />
      case "ASSIGNED":
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4" />
      case "RESOLVED":
        return <CheckCircle className="h-4 w-4" />
      case "CLOSED":
        return <CheckCircle className="h-4 w-4" />
      case "REJECTED":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "HIGH":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "MEDIUM":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "LOW":
        return <Clock className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Complaint Management</h2>
          <p className="text-muted-foreground">
            Track, assign, and resolve student complaints efficiently
          </p>
        </div>
      </div>

      <Tabs defaultValue="complaints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="complaints" className="space-y-4">
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
                    placeholder="Search complaints..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="ASSIGNED">Assigned</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="ACADEMIC">Academic</SelectItem>
                      <SelectItem value="INFRASTRUCTURE">Infrastructure</SelectItem>
                      <SelectItem value="HOSTEL">Hostel</SelectItem>
                      <SelectItem value="FOOD">Food</SelectItem>
                      <SelectItem value="TRANSPORT">Transport</SelectItem>
                      <SelectItem value="TECHNICAL">Technical</SelectItem>
                      <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                      <SelectItem value="LIBRARY">Library</SelectItem>
                      <SelectItem value="SPORTS">Sports</SelectItem>
                      <SelectItem value="MEDICAL">Medical</SelectItem>
                      <SelectItem value="FINANCIAL">Financial</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ status: "all", category: "all", priority: "all", assignedToId: "unassigned", search: "" })}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complaints List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Complaints
              </CardTitle>
              <CardDescription>
                {complaints.length} complaint(s) found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Complaint</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Loading complaints...
                        </TableCell>
                      </TableRow>
                    ) : complaints && Array.isArray(complaints) && complaints.length > 0 ? (
                      complaints.map((complaint) => (
                        <TableRow key={complaint.id}>
                          <TableCell className="font-medium">
                          <div className="max-w-xs">
                            <div className="font-semibold line-clamp-1">{complaint.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">{complaint.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{complaint.student?.firstName || 'Unknown'} {complaint.student?.lastName || ''}</div>
                              <div className="text-sm text-muted-foreground">{complaint.student?.email || 'No email'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`border-${categoryColors[complaint.category as keyof typeof categoryColors]}-500`}>
                            {complaint.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(complaint.priority)}
                            <Badge variant="outline" className={`border-${priorityColors[complaint.priority as keyof typeof priorityColors]}-500`}>
                              {complaint.priority}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(complaint.status)}
                            <Badge variant="outline" className={`border-${statusColors[complaint.status as keyof typeof statusColors]}-500`}>
                              {complaint.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {complaint.assignedTo ? (
                            <div className="text-sm">
                              <div>{complaint.assignedTo.firstName} {complaint.assignedTo.lastName}</div>
                              <div className="text-muted-foreground">{complaint.assignedTo.email}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {complaint.createdAt ? format(new Date(complaint.createdAt), "MMM dd, yyyy") : 'Unknown date'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              className="text-xs flex items-center gap-1"
                              variant="outline"
                              onClick={() => viewComplaintDetails(complaint)}
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            <Button
                              className="text-xs flex items-center gap-1"
                              variant="outline"
                              onClick={() => openStatusDialog(complaint)}
                            >
                              <MessageSquare className="h-3 w-3" />
                              Update
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No complaints found
                        </TableCell>
                      </TableRow>
                    )}
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
                Complaint Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{stats?.totalComplaints || 0}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats?.openComplaints || 0}</div>
                      <div className="text-sm text-muted-foreground">Open</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{stats?.inProgressComplaints || 0}</div>
                      <div className="text-sm text-muted-foreground">In Progress</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats?.resolvedComplaints || 0}</div>
                      <div className="text-sm text-muted-foreground">Resolved</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{stats?.avgResolutionTime ? stats.avgResolutionTime.toFixed(1) : '0.0'} days</div>
                      <div className="text-sm text-muted-foreground">Avg Resolution</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Complaints by Category</h3>
                      <div className="space-y-2">
                        {stats?.complaintsByCategory && Array.isArray(stats.complaintsByCategory) ? (
                          stats.complaintsByCategory.map((item) => (
                            <div key={item.category} className="flex items-center justify-between p-3 border rounded-lg">
                              <span className="font-medium">{item.category}</span>
                              <Badge variant="secondary">{item.count}</Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No category data available</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Complaints by Priority</h3>
                      <div className="space-y-2">
                        {stats?.complaintsByPriority && Array.isArray(stats.complaintsByPriority) ? (
                          stats.complaintsByPriority.map((item) => (
                            <div key={item.priority} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-2">
                                {getPriorityIcon(item.priority)}
                                <span className="font-medium">{item.priority}</span>
                              </div>
                              <Badge variant="secondary">{item.count}</Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No priority data available</p>
                        )}
                      </div>
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

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Complaint Status</DialogTitle>
            <DialogDescription>
              Change the status and assignment of the complaint
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusUpdate.status} onValueChange={(value: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED") => setStatusUpdate(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={statusUpdate.assignedToId || "unassigned"} onValueChange={(value) => setStatusUpdate(prev => ({ ...prev, assignedToId: value === "unassigned" ? undefined : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select admin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users && Array.isArray(users) ? users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea
                value={statusUpdate.resolutionNotes || ""}
                onChange={(e) => setStatusUpdate(prev => ({ ...prev, resolutionNotes: e.target.value }))}
                placeholder="Add resolution notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={loading}>
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complaint Details Sheet */}
      <Sheet open={showDetailsSheet} onOpenChange={setShowDetailsSheet}>
        <SheetContent className="w-[800px] sm:w-[800px]">
          <SheetHeader>
            <SheetTitle>
              Complaint Details
            </SheetTitle>
            <SheetDescription>
              View and manage complaint information and updates
            </SheetDescription>
          </SheetHeader>
          
          {selectedComplaint && (
            <div className="space-y-6 py-6">
              {/* Complaint Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedComplaint.title}</span>
                    <div className="flex gap-2">
                      {getPriorityIcon(selectedComplaint.priority)}
                      <Badge variant="outline" className={`border-${statusColors[selectedComplaint.status as keyof typeof statusColors]}-500`}>
                        {selectedComplaint.status}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedComplaint.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p className="mt-1">
                        <Badge variant="outline">
                          {selectedComplaint.category}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Priority</Label>
                      <p className="mt-1">
                        <Badge variant="outline">
                          {selectedComplaint.priority}
                        </Badge>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Student</Label>
                      <p className="mt-1 text-sm">
                        {selectedComplaint.student?.firstName || 'Unknown'} {selectedComplaint.student?.lastName || ''}
                        <br />
                        <span className="text-muted-foreground">{selectedComplaint.student?.email || 'No email'}</span>
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Assigned To</Label>
                      <p className="mt-1 text-sm">
                        {selectedComplaint.assignedTo ? (
                          <>
                            {selectedComplaint.assignedTo.firstName} {selectedComplaint.assignedTo.lastName}
                            <br />
                            <span className="text-muted-foreground">{selectedComplaint.assignedTo.email}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedComplaint.createdAt ? format(new Date(selectedComplaint.createdAt), "PPP 'at' p") : 'Unknown date'}
                    </p>
                  </div>

                  {selectedComplaint.resolutionNotes && (
                    <div>
                      <Label className="text-sm font-medium">Resolution Notes</Label>
                      <p className="mt-1 text-sm text-muted-foreground">{selectedComplaint.resolutionNotes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => openStatusDialog(selectedComplaint)}
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Update Status
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteComplaint(selectedComplaint.id)}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Updates */}
              <Card>
                <CardHeader>
                  <CardTitle>Updates & Communication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add New Update */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <Label>Add Update</Label>
                    <Textarea
                      value={newUpdate.message}
                      onChange={(e) => setNewUpdate(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Enter your update or response..."
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isInternal"
                          checked={newUpdate.isInternal}
                          onChange={(e) => setNewUpdate(prev => ({ ...prev, isInternal: e.target.checked }))}
                          className="rounded"
                          title="Mark as internal note"
                          aria-label="Mark as internal note"
                        />
                        <Label htmlFor="isInternal" className="text-sm">Internal note (not visible to student)</Label>
                      </div>
                      <Button onClick={handleAddUpdate} disabled={loading || !newUpdate.message.trim()}>
                        {loading ? "Adding..." : "Add Update"}
                      </Button>
                    </div>
                  </div>

                  {/* Updates History */}
                  <div className="space-y-3">
                    <Label>Update History</Label>
                    {selectedComplaint.updates && Array.isArray(selectedComplaint.updates) && selectedComplaint.updates.length > 0 ? (
                      <div className="space-y-3">
                        {selectedComplaint.updates.map((update) => (
                          <div key={update.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {update.updatedBy?.firstName || 'Unknown'} {update.updatedBy?.lastName || 'User'}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {update.updatedBy?.role || 'Unknown'}
                                </Badge>
                                {update.isInternal && (
                                  <Badge variant="destructive" className="text-xs">
                                    Internal
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {update.createdAt ? format(new Date(update.createdAt), "MMM dd, yyyy 'at' h:mm a") : 'Unknown date'}
                              </span>
                            </div>
                            <p className="text-sm">{update.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No updates yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
