// Common API types
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    errors?: { [key: string]: string[] };
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiError {
    success: false;
    message: string;
    error?: string;
    status?: number;
}

// Filter base interface
export interface BaseFilters {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

// Course filters for public browsing
export interface CourseFilters extends BaseFilters {
    universityId?: string;
    sortBy?: "name" | "code" | "totalFees" | "currentStudents" | "createdAt";
}

// University filters for public browsing
export interface UniversityFilters extends BaseFilters {
    type?: "PUBLIC" | "PRIVATE";
    sortBy?: "name" | "establishedYear" | "location" | "createdAt";
}

// Hostel filters for browsing
export interface HostelFilters extends BaseFilters {
    universityId?: string;
    type?: "AC" | "NON_AC";
    maxFees?: number;
    minCapacity?: number;
    sortBy?: "name" | "fees" | "totalCapacity" | "type" | "createdAt";
}

// Notice filters
export interface NoticeFilters extends BaseFilters {
    universityId?: string;
    publishedAfter?: string;
    publishedBefore?: string;
    sortBy?: "title" | "publishedAt" | "createdAt";
}
