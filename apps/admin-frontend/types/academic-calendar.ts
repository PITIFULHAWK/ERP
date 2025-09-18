export interface AcademicCalendar {
    id: string;
    academicYear: string;
    title: string;
    description?: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    uploadedBy: {
        id: string;
        firstName: string;
        lastName: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAcademicCalendarRequest {
    academicYear: string;
    title: string;
    description?: string;
}

export interface UpdateAcademicCalendarRequest {
    title?: string;
    description?: string;
    isActive?: boolean;
}

export interface AcademicCalendarFilters {
    academicYear?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}
