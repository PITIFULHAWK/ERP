export interface Placement {
    id: string;
    title: string;
    description: string;
    companyName: string;
    position: string;
    packageOffered?: string;
    cgpaCriteria?: number;
    location?: string;
    applicationDeadline?: string;
    status: "ACTIVE" | "CLOSED" | "DRAFT";
    createdAt: string;
    updatedAt: string;
    createdById: string;
    emailsSent: number;
    createdBy: {
        id: string;
        name: string;
        email: string;
    };
}

export interface CreatePlacementRequest {
    title: string;
    description: string;
    companyName: string;
    position: string;
    packageOffered?: string;
    cgpaCriteria?: number;
    location?: string;
    applicationDeadline?: string;
}

export interface UpdatePlacementRequest
    extends Partial<CreatePlacementRequest> {
    status?: "ACTIVE" | "CLOSED" | "DRAFT";
}

export interface PlacementStats {
    totalPlacements: number;
    activePlacements: number;
    closedPlacements: number;
    totalEmailsSent: number;
}

export interface EligibleUsersInfo {
    placementId: string;
    placementTitle: string;
    cgpaCriteria?: number;
    eligibleUsersCount: number;
}

export interface NotificationResult {
    placementTitle: string;
    eligibleUsersFound: number;
    emailsSent: number;
    cgpaCriteria?: number;
    recipients: Array<{
        name: string;
        email: string;
        cgpa?: number;
    }>;
}
