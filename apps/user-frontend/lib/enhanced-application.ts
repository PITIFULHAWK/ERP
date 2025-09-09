import { apiClient, type ApiResponse } from "./api-client"

interface PersonalInfo {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: "MALE" | "FEMALE" | "OTHER"
  nationality: string
  phoneNumber: string
  alternatePhoneNumber?: string
}

interface AddressInfo {
  address: string
  city: string
  state: string
  pincode: string
  correspondenceAddress?: string
  correspondenceCity?: string
  correspondenceState?: string
  correspondencePincode?: string
  sameAsPermament: boolean
}

interface AcademicInfo {
  class10Percentage: number
  class10Board: string
  class10YearOfPassing: number
  class12Percentage: number
  class12Board: string
  class12YearOfPassing: number
  class12Stream: string
  hasJeeMainsScore: boolean
  jeeMainsScore?: number
  jeeMainsRank?: number
  jeeMainsYear?: number
}

interface CoursePreference {
  preferredCourseId: string
  alternativeCourseId?: string
}

export interface ApplicationFormData {
  personalInfo: PersonalInfo
  addressInfo: AddressInfo
  academicInfo: AcademicInfo
  coursePreference: CoursePreference
}

export interface Application {
  id: string
  userId: string
  status: "DRAFT" | "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "INCOMPLETE"
  personalInfo: PersonalInfo
  addressInfo: AddressInfo
  academicInfo: AcademicInfo
  coursePreference: CoursePreference
  documentsUploaded: DocumentType[]
  documentsVerified: DocumentType[]
  submittedAt?: string
  lastUpdated: string
  reviewComments?: string
}

export type DocumentType =
  | "class10Certificate"
  | "class12Certificate"
  | "jeeMainsScorecard"
  | "photo"
  | "signature"
  | "identityProof"
  | "addressProof"
  | "categoryCertificate"
  | "incomeCertificate"

interface DocumentUploadResponse {
  documentId: string
  documentType: DocumentType
  fileName: string
  uploadedAt: string
}

export class EnhancedApplicationAPI {
  static async createApplication(applicationData: ApplicationFormData): Promise<ApiResponse<Application>> {
    try {
      return await apiClient.post<Application>("/applications", applicationData)
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to create application",
        error: error.message,
      }
    }
  }

  static async updateApplication(
    applicationId: string,
    applicationData: Partial<ApplicationFormData>,
  ): Promise<ApiResponse<Application>> {
    try {
      return await apiClient.patch<Application>(`/applications/${applicationId}`, applicationData)
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update application",
        error: error.message,
      }
    }
  }

  static async getMyApplication(): Promise<ApiResponse<Application>> {
    try {
      return await apiClient.get<Application>("/applications/me")
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to get application",
        error: error.message,
      }
    }
  }

  static async getApplicationById(applicationId: string): Promise<ApiResponse<Application>> {
    try {
      return await apiClient.get<Application>(`/applications/${applicationId}`)
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to get application",
        error: error.message,
      }
    }
  }

  static async submitApplication(applicationId: string): Promise<ApiResponse<Application>> {
    try {
      return await apiClient.post<Application>(`/applications/${applicationId}/submit`)
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to submit application",
        error: error.message,
      }
    }
  }

  static async uploadDocument(
    applicationId: string,
    documentType: DocumentType,
    file: File,
  ): Promise<ApiResponse<DocumentUploadResponse>> {
    try {
      return await apiClient.uploadFile<DocumentUploadResponse>(`/applications/${applicationId}/documents`, file, {
        type: documentType,
      })
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to upload document",
        error: error.message,
      }
    }
  }

  static async deleteDocument(applicationId: string, documentId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      return await apiClient.delete<{ message: string }>(`/applications/${applicationId}/documents/${documentId}`)
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to delete document",
        error: error.message,
      }
    }
  }

  static async getDocuments(applicationId: string): Promise<ApiResponse<DocumentUploadResponse[]>> {
    try {
      return await apiClient.get<DocumentUploadResponse[]>(`/applications/${applicationId}/documents`)
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to get documents",
        error: error.message,
      }
    }
  }

  static async autoSave(
    applicationId: string,
    section: keyof ApplicationFormData,
    data: any,
  ): Promise<ApiResponse<Application>> {
    try {
      return await apiClient.patch<Application>(`/applications/${applicationId}/autosave`, {
        section,
        data,
      })
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Auto-save failed",
        error: error.message,
      }
    }
  }
}

export const DOCUMENT_TYPES: { [key in DocumentType]: string } = {
  class10Certificate: "Class 10 Certificate",
  class12Certificate: "Class 12 Certificate",
  jeeMainsScorecard: "JEE Mains Scorecard",
  photo: "Passport Size Photo",
  signature: "Signature",
  identityProof: "Identity Proof (Aadhaar/PAN)",
  addressProof: "Address Proof",
  categoryCertificate: "Category Certificate",
  incomeCertificate: "Income Certificate",
}

export const REQUIRED_DOCUMENTS: DocumentType[] = [
  "class10Certificate",
  "class12Certificate",
  "photo",
  "signature",
  "identityProof",
  "addressProof",
]

export const OPTIONAL_DOCUMENTS: DocumentType[] = ["jeeMainsScorecard", "categoryCertificate", "incomeCertificate"]
