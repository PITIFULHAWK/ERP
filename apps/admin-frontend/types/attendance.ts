export interface AttendanceRecord {
    id: string;
    status: "PRESENT" | "ABSENT";
    date: string;
    enrollment: {
        id: string;
        student: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
    };
    subject: {
        id: string;
        name: string;
        code: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface AttendanceStats {
    totalClasses: number;
    presentClasses: number;
    absentClasses: number;
    attendancePercentage: number;
}

export interface CreateAttendanceRequest {
    enrollmentId: string;
    subjectId: string;
    status: "PRESENT" | "ABSENT";
    date: string;
}

export interface AttendanceFilters {
    enrollmentId?: string;
    subjectId?: string;
    status?: "PRESENT" | "ABSENT";
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface BulkAttendanceRequest {
    subjectId: string;
    date: string;
    attendanceRecords: {
        enrollmentId: string;
        status: "PRESENT" | "ABSENT";
    }[];
}
