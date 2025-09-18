export interface Resource {
    id: string;
    title: string;
    description: string;
    type: "PDF" | "VIDEO" | "AUDIO" | "IMAGE" | "DOCUMENT" | "LINK" | "OTHER";
    fileUrl?: string;
    externalUrl?: string;
    fileSize?: number;
    mimeType?: string;
    isPublic: boolean;
    uploadedBy: {
        id: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    subject?: {
        id: string;
        name: string;
        code: string;
    };
    section?: {
        id: string;
        name: string;
        code: string;
    };
    semester?: {
        id: string;
        number: number;
    };
    course?: {
        id: string;
        name: string;
    };
    downloads: number;
    views: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateResourceRequest {
    title: string;
    description: string;
    type: "PDF" | "VIDEO" | "AUDIO" | "IMAGE" | "DOCUMENT" | "LINK" | "OTHER";
    externalUrl?: string;
    isPublic?: boolean;
    subjectId?: string;
    semesterId?: string;
    courseId?: string;
    sectionId?: string;
}

export interface UpdateResourceRequest {
    title?: string;
    description?: string;
    type?: "PDF" | "VIDEO" | "AUDIO" | "IMAGE" | "DOCUMENT" | "LINK" | "OTHER";
    externalUrl?: string;
    isPublic?: boolean;
    subjectId?: string;
    semesterId?: string;
    courseId?: string;
    sectionId?: string;
}

export interface ResourceFilters {
    type?: string;
    subjectId?: string;
    semesterId?: string;
    courseId?: string;
    uploadedBy?: string;
    isPublic?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface ResourceStats {
    totalResources: number;
    totalDownloads: number;
    totalViews: number;
    resourcesByType: {
        type: string;
        count: number;
    }[];
}
