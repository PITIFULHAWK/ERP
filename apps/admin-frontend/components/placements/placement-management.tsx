"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { toast } from "../../hooks/use-toast";
import { 
    Plus, 
    Eye, 
    Edit, 
    Send, 
    Users, 
    Building, 
    MapPin, 
    DollarSign,
    BarChart3,
    Mail,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import { Placement, CreatePlacementRequest, UpdatePlacementRequest, PlacementStats, EligibleUsersInfo, NotificationResult } from "../../types/placement";
import { apiClient } from "../../lib/api-client";

const PlacementManagement = () => {
    const [placements, setPlacements] = useState<Placement[]>([]);
    const [placementStats, setPlacementStats] = useState<PlacementStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [createFormData, setCreateFormData] = useState<CreatePlacementRequest>({
        title: "",
        description: "",
        companyName: "",
        position: "",
        packageOffered: "",
        cgpaCriteria: undefined,
        location: "",
        applicationDeadline: ""
    });
    const [editFormData, setEditFormData] = useState<UpdatePlacementRequest>({});

    // Fetch placements
    const fetchPlacements = async () => {
        try {
            setLoading(true);
            
            const data = await apiClient.getPlacements({
                page: currentPage,
                limit: 10,
                ...(statusFilter !== "all" && { status: statusFilter })
            });

            if (data.success) {
                setPlacements(data.data.placements);
                setTotalPages(data.data.pagination.totalPages);
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to fetch placements",
                    variant: "destructive"
                });
            }
        } catch {
            toast({
                title: "Error",
                description: "Failed to fetch placements",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch placement statistics
    const fetchPlacementStats = async () => {
        try {
            const data = await apiClient.getPlacementStats();

            if (data.success) {
                setPlacementStats(data.data);
            }
        } catch {
            console.error("Failed to fetch placement stats");
        }
    };

    // Create placement
    const handleCreatePlacement = async () => {
        try {
            const placementData = {
                ...createFormData,
                cgpaCriteria: createFormData.cgpaCriteria ? Number(createFormData.cgpaCriteria) : undefined,
                applicationDeadline: createFormData.applicationDeadline || undefined
            };

            const data = await apiClient.createPlacement(placementData);

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Placement created successfully"
                });
                setIsCreateDialogOpen(false);
                setCreateFormData({
                    title: "",
                    description: "",
                    companyName: "",
                    position: "",
                    packageOffered: "",
                    cgpaCriteria: undefined,
                    location: "",
                    applicationDeadline: ""
                });
                fetchPlacements();
                fetchPlacementStats();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to create placement",
                    variant: "destructive"
                });
            }
        } catch {
            toast({
                title: "Error",
                description: "Failed to create placement",
                variant: "destructive"
            });
        }
    };

    // Update placement
    const handleUpdatePlacement = async () => {
        if (!selectedPlacement) return;
        
        try {
            const updateData = {
                ...editFormData,
                cgpaCriteria: editFormData.cgpaCriteria ? Number(editFormData.cgpaCriteria) : undefined
            };

            const data = await apiClient.updatePlacement(selectedPlacement.id, updateData);

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Placement updated successfully"
                });
                setIsEditDialogOpen(false);
                setEditFormData({});
                setSelectedPlacement(null);
                fetchPlacements();
                fetchPlacementStats();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to update placement",
                    variant: "destructive"
                });
            }
        } catch {
            toast({
                title: "Error",
                description: "Failed to update placement",
                variant: "destructive"
            });
        }
    };

    // Get eligible users count
    const getEligibleUsersCount = async (placementId: string): Promise<EligibleUsersInfo | null> => {
        try {
            const data = await apiClient.getEligibleUsersCount(placementId);

            if (data.success) {
                return data.data;
            }
            return null;
        } catch {
            return null;
        }
    };

    // Send placement notifications
    const handleSendNotifications = async (placement: Placement) => {
        try {
            // First, get eligible users count
            const eligibleInfo = await getEligibleUsersCount(placement.id);
            
            if (!eligibleInfo || eligibleInfo.eligibleUsersCount === 0) {
                toast({
                    title: "No Eligible Users",
                    description: "No students meet the CGPA criteria for this placement",
                    variant: "destructive"
                });
                return;
            }

            // Confirm before sending
            const confirmSend = window.confirm(
                `Send notifications to ${eligibleInfo.eligibleUsersCount} eligible students for "${placement.title}"?`
            );

            if (!confirmSend) return;

            const data = await apiClient.sendPlacementNotifications(placement.id);

            if (data.success) {
                const result: NotificationResult = data.data;
                toast({
                    title: "Notifications Sent",
                    description: `Successfully sent ${result.emailsSent} notifications to eligible students`
                });
                fetchPlacements();
                fetchPlacementStats();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to send notifications",
                    variant: "destructive"
                });
            }
        } catch {
            toast({
                title: "Error",
                description: "Failed to send notifications",
                variant: "destructive"
            });
        }
    };

    // Initialize edit form when placement is selected
    const openEditDialog = (placement: Placement) => {
        setSelectedPlacement(placement);
        setEditFormData({
            title: placement.title,
            description: placement.description,
            companyName: placement.companyName,
            position: placement.position,
            packageOffered: placement.packageOffered || "",
            cgpaCriteria: placement.cgpaCriteria,
            location: placement.location || "",
            applicationDeadline: placement.applicationDeadline ? placement.applicationDeadline.slice(0, 16) : "",
            status: placement.status
        });
        setIsEditDialogOpen(true);
    };

    // Filter placements based on search term
    const filteredPlacements = placements.filter(placement =>
        placement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        placement.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        placement.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchPlacements();
        fetchPlacementStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, statusFilter]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <Badge className="bg-green-100 text-green-800">Active</Badge>;
            case "CLOSED":
                return <Badge className="bg-red-100 text-red-800">Closed</Badge>;
            case "DRAFT":
                return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Statistics Dashboard */}
            {placementStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center">
                                <BarChart3 className="h-8 w-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Placements</p>
                                    <p className="text-2xl font-bold">{placementStats.totalPlacements}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Active Placements</p>
                                    <p className="text-2xl font-bold">{placementStats.activePlacements}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Closed Placements</p>
                                    <p className="text-2xl font-bold">{placementStats.closedPlacements}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center">
                                <Mail className="h-8 w-8 text-purple-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Emails Sent</p>
                                    <p className="text-2xl font-bold">{placementStats.totalEmailsSent}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                        placeholder="Search placements..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-80"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Placement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Placement</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={createFormData.title}
                                        onChange={(e) => setCreateFormData({...createFormData, title: e.target.value})}
                                        placeholder="e.g., Software Engineer"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="companyName">Company Name *</Label>
                                    <Input
                                        id="companyName"
                                        value={createFormData.companyName}
                                        onChange={(e) => setCreateFormData({...createFormData, companyName: e.target.value})}
                                        placeholder="e.g., TechCorp Solutions"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="position">Position *</Label>
                                    <Input
                                        id="position"
                                        value={createFormData.position}
                                        onChange={(e) => setCreateFormData({...createFormData, position: e.target.value})}
                                        placeholder="e.g., Full Stack Developer"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="packageOffered">Package Offered</Label>
                                    <Input
                                        id="packageOffered"
                                        value={createFormData.packageOffered}
                                        onChange={(e) => setCreateFormData({...createFormData, packageOffered: e.target.value})}
                                        placeholder="e.g., 12-15 LPA"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={createFormData.location}
                                        onChange={(e) => setCreateFormData({...createFormData, location: e.target.value})}
                                        placeholder="e.g., Bangalore, India"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="cgpaCriteria">Minimum CGPA</Label>
                                    <Input
                                        id="cgpaCriteria"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="10"
                                        value={createFormData.cgpaCriteria || ""}
                                        onChange={(e) => setCreateFormData({...createFormData, cgpaCriteria: e.target.value ? Number(e.target.value) : undefined})}
                                        placeholder="e.g., 7.5"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="applicationDeadline">Application Deadline</Label>
                                <Input
                                    id="applicationDeadline"
                                    type="datetime-local"
                                    value={createFormData.applicationDeadline}
                                    onChange={(e) => setCreateFormData({...createFormData, applicationDeadline: e.target.value})}
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={createFormData.description}
                                    onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                                    placeholder="Detailed job description, requirements, and benefits..."
                                    rows={4}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreatePlacement}>
                                    Create Placement
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Placements List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8">Loading placements...</div>
                ) : filteredPlacements.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No placements found</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredPlacements.map((placement) => (
                        <Card key={placement.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold">{placement.title}</h3>
                                            {getStatusBadge(placement.status)}
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center">
                                                <Building className="w-4 h-4 mr-2" />
                                                {placement.companyName}
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-2" />
                                                {placement.position}
                                            </div>
                                            {placement.location && (
                                                <div className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-2" />
                                                    {placement.location}
                                                </div>
                                            )}
                                            {placement.packageOffered && (
                                                <div className="flex items-center">
                                                    <DollarSign className="w-4 h-4 mr-2" />
                                                    {placement.packageOffered}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            {placement.cgpaCriteria && (
                                                <span>Min CGPA: {placement.cgpaCriteria}</span>
                                            )}
                                            <span>Emails Sent: {placement.emailsSent}</span>
                                            <span>Created: {new Date(placement.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            aria-label="View placement"
                                            onClick={() => {
                                                setSelectedPlacement(placement);
                                                setIsViewDialogOpen(true);
                                            }}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            aria-label="Edit placement"
                                            onClick={() => openEditDialog(placement)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSendNotifications(placement)}
                                            disabled={placement.status !== "ACTIVE"}
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="px-4 py-2">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* View Placement Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    {selectedPlacement && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                    {selectedPlacement.title}
                                    {getStatusBadge(selectedPlacement.status)}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">Company Details</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><strong>Company:</strong> {selectedPlacement.companyName}</p>
                                            <p><strong>Position:</strong> {selectedPlacement.position}</p>
                                            {selectedPlacement.packageOffered && (
                                                <p><strong>Package:</strong> {selectedPlacement.packageOffered}</p>
                                            )}
                                            {selectedPlacement.location && (
                                                <p><strong>Location:</strong> {selectedPlacement.location}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-semibold mb-2">Requirements & Stats</h4>
                                        <div className="space-y-2 text-sm">
                                            {selectedPlacement.cgpaCriteria && (
                                                <p><strong>Min CGPA:</strong> {selectedPlacement.cgpaCriteria}</p>
                                            )}
                                            <p><strong>Emails Sent:</strong> {selectedPlacement.emailsSent}</p>
                                            {selectedPlacement.applicationDeadline && (
                                                <p><strong>Deadline:</strong> {new Date(selectedPlacement.applicationDeadline).toLocaleString()}</p>
                                            )}
                                            <p><strong>Created:</strong> {new Date(selectedPlacement.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Description</h4>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedPlacement.description}</p>
                                </div>

                                {selectedPlacement.createdBy && (
                                    <div>
                                        <h4 className="font-semibold mb-2">Created By</h4>
                                        <p className="text-sm">
                                            {selectedPlacement.createdBy?.name} ({selectedPlacement.createdBy?.email})
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Placement Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Placement</DialogTitle>
                    </DialogHeader>
                    {selectedPlacement && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-title">Title</Label>
                                    <Input
                                        id="edit-title"
                                        value={editFormData.title || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                        placeholder="Placement title"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-company">Company Name</Label>
                                    <Input
                                        id="edit-company"
                                        value={editFormData.companyName || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                                        placeholder="Company name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-position">Position</Label>
                                    <Input
                                        id="edit-position"
                                        value={editFormData.position || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                                        placeholder="Job position"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-package">Package Offered</Label>
                                    <Input
                                        id="edit-package"
                                        value={editFormData.packageOffered || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, packageOffered: e.target.value })}
                                        placeholder="e.g., 5-8 LPA"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-cgpa">CGPA Criteria (Optional)</Label>
                                    <Input
                                        id="edit-cgpa"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="10"
                                        value={editFormData.cgpaCriteria || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, cgpaCriteria: e.target.value ? Number(e.target.value) : undefined })}
                                        placeholder="Minimum CGPA required"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-location">Location</Label>
                                    <Input
                                        id="edit-location"
                                        value={editFormData.location || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                                        placeholder="Job location"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-deadline">Application Deadline (Optional)</Label>
                                    <Input
                                        id="edit-deadline"
                                        type="datetime-local"
                                        value={editFormData.applicationDeadline || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, applicationDeadline: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-status">Status</Label>
                                    <Select 
                                        value={editFormData.status || "DRAFT"} 
                                        onValueChange={(value) => setEditFormData({ ...editFormData, status: value as "DRAFT" | "ACTIVE" | "CLOSED" })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DRAFT">Draft</SelectItem>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="CLOSED">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editFormData.description || ""}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    placeholder="Placement description and requirements"
                                    rows={4}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdatePlacement}>
                                    Update Placement
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PlacementManagement;