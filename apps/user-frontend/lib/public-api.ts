import { apiClient, type ApiResponse } from "./api-client"

interface University {
  id: string
  name: string
  code: string
  location: string
  type: "PUBLIC" | "PRIVATE"
  establishedYear: number
  website?: string
  description?: string
  logo?: string
  ranking?: number
  accreditation: string[]
  coursesOffered: number
  totalSeats: number
  applicationDeadline: string
  createdAt: string
}

interface Course {
  id: string
  name: string
  code: string
  universityId: string
  university: University
  duration: number
  degree: "BACHELOR" | "MASTER" | "DIPLOMA"
  stream: string
  description?: string
  eligibility: string
  totalSeats: number
  availableSeats: number
  fees: number
  applicationDeadline: string
  createdAt: string
}

interface Notice {
  id: string
  title: string
  content: string
  type: "GENERAL" | "ADMISSION" | "EXAM" | "RESULT" | "IMPORTANT"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  publishedAt: string
  expiresAt?: string
  attachments?: string[]
  universityId?: string
  university?: University
  createdAt: string
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface SearchFilters {
  search?: string
  type?: string
  location?: string
  stream?: string
  degree?: string
  minFees?: number
  maxFees?: number
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export class PublicAPI {
  // Universities
  static async getUniversities(filters?: SearchFilters): Promise<ApiResponse<PaginatedResponse<University>>> {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString())
          }
        })
      }

      const endpoint = `/public/universities${params.toString() ? `?${params.toString()}` : ""}`
      return await apiClient.get<PaginatedResponse<University>>(endpoint)
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch universities",
        error: error.message,
      }
    }
  }

  static async getUniversityById(id: string): Promise<ApiResponse<University>> {
    try {
      return await apiClient.get<University>(`/public/universities/${id}`)
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch university",
        error: error.message,
      }
    }
  }

  // Courses
  static async getCourses(filters?: SearchFilters): Promise<ApiResponse<PaginatedResponse<Course>>> {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString())
          }
        })
      }

      const endpoint = `/public/courses${params.toString() ? `?${params.toString()}` : ""}`
      return await apiClient.get<PaginatedResponse<Course>>(endpoint)
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch courses",
        error: error.message,
      }
    }
  }

  static async getCourseById(id: string): Promise<ApiResponse<Course>> {
    try {
      return await apiClient.get<Course>(`/public/courses/${id}`)
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch course",
        error: error.message,
      }
    }
  }

  static async getCoursesByUniversity(universityId: string): Promise<ApiResponse<Course[]>> {
    try {
      return await apiClient.get<Course[]>(`/public/universities/${universityId}/courses`)
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch university courses",
        error: error.message,
      }
    }
  }

  // Notices
  static async getNotices(filters?: SearchFilters): Promise<ApiResponse<PaginatedResponse<Notice>>> {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString())
          }
        })
      }

      const endpoint = `/public/notices${params.toString() ? `?${params.toString()}` : ""}`
      return await apiClient.get<PaginatedResponse<Notice>>(endpoint)
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch notices",
        error: error.message,
      }
    }
  }

  static async getNoticeById(id: string): Promise<ApiResponse<Notice>> {
    try {
      return await apiClient.get<Notice>(`/public/notices/${id}`)
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch notice",
        error: error.message,
      }
    }
  }

  // Statistics
  static async getStatistics(): Promise<
    ApiResponse<{
      totalUniversities: number
      totalCourses: number
      totalApplications: number
      totalStudents: number
    }>
  > {
    try {
      return await apiClient.get("/public/statistics")
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch statistics",
        error: error.message,
      }
    }
  }
}

export type { University, Course, Notice, PaginatedResponse, SearchFilters }
