export interface Complaint {
    id: string;
    title: string;
    description: string;
    category:
        | "ACADEMIC"
        | "INFRASTRUCTURE"
        | "HOSTEL"
        | "FOOD"
        | "TRANSPORT"
        | "TECHNICAL"
        | "ADMINISTRATIVE"
        | "LIBRARY"
        | "SPORTS"
        | "MEDICAL"
        | "FINANCIAL"
        | "OTHER";
    status:
        | "OPEN"
        | "ASSIGNED"
        | "IN_PROGRESS"
        | "RESOLVED"
        | "CLOSED"
        | "REJECTED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    studentId: string;
    assignedToId?: string;
    resolutionNotes?: string;
    student: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    assignedTo?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    updates: ComplaintUpdate[];
    createdAt: string;
    updatedAt: string;
}

export interface ComplaintUpdate {
    id: string;
    complaintId: string;
    message: string;
    isInternal: boolean;
    updatedBy: {
        id: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    createdAt: string;
}

export interface CreateComplaintRequest {
    title: string;
    description: string;
    category:
        | "ACADEMIC"
        | "INFRASTRUCTURE"
        | "HOSTEL"
        | "FOOD"
        | "TRANSPORT"
        | "TECHNICAL"
        | "ADMINISTRATIVE"
        | "LIBRARY"
        | "SPORTS"
        | "MEDICAL"
        | "FINANCIAL"
        | "OTHER";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

export interface UpdateComplaintStatusRequest {
    status:
        | "OPEN"
        | "ASSIGNED"
        | "IN_PROGRESS"
        | "RESOLVED"
        | "CLOSED"
        | "REJECTED";
    assignedToId?: string;
    resolutionNotes?: string;
}

export interface AddComplaintUpdateRequest {
    message: string;
    isInternal: boolean;
}

export interface ComplaintFilters {
    status?: string;
    category?: string;
    priority?: string;
    studentId?: string;
    assignedToId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface ComplaintStats {
    totalComplaints: number;
    openComplaints: number;
    inProgressComplaints: number;
    resolvedComplaints: number;
    closedComplaints: number;
    avgResolutionTime: number;
    complaintsByCategory: {
        category: string;
        count: number;
    }[];
    complaintsByPriority: {
        priority: string;
        count: number;
    }[];
}
