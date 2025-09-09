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
  | "CLASS_10_MARKSHEET"
  | "CLASS_12_MARKSHEET"
  | "JEE_MAINS_SCORECARD"
  | "PHOTO"
  | "SIGNATURE"
  | "IDENTITY_PROOF"
  | "ADDRESS_PROOF"
  | "CATEGORY_CERTIFICATE"
  | "INCOME_CERTIFICATE"

interface ApplicationResponse {
  success: boolean
  message: string
  data?: Application
  error?: string
}

const API_BASE_URL = "http://localhost:5000/api/v1"

export class ApplicationAPI {
  private static getAuthHeaders() {
    const token = localStorage.getItem("auth_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  static async createApplication(applicationData: ApplicationFormData): Promise<ApplicationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(applicationData),
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        message: "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  static async updateApplication(
    applicationId: string,
    applicationData: Partial<ApplicationFormData>,
  ): Promise<ApplicationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(applicationData),
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        message: "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  static async getMyApplication(): Promise<ApplicationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        headers: this.getAuthHeaders(),
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        message: "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  static async getApplicationById(applicationId: string): Promise<ApplicationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
        headers: this.getAuthHeaders(),
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        message: "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  static async submitApplication(applicationId: string): Promise<ApplicationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/submit`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        message: "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  static async uploadDocument(
    applicationId: string,
    documentType: DocumentType,
    file: File,
  ): Promise<ApplicationResponse> {
    try {
      const formData = new FormData()
      formData.append("document", file)
      formData.append("type", documentType)

      const token = localStorage.getItem("auth_token")
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/documents`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        message: "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export const DOCUMENT_TYPES: { [key in DocumentType]: string } = {
  CLASS_10_MARKSHEET: "Class 10 Marksheet",
  CLASS_12_MARKSHEET: "Class 12 Marksheet",
  JEE_MAINS_SCORECARD: "JEE Mains Scorecard",
  PHOTO: "Passport Size Photo",
  SIGNATURE: "Signature",
  IDENTITY_PROOF: "Identity Proof (Aadhaar/PAN)",
  ADDRESS_PROOF: "Address Proof",
  CATEGORY_CERTIFICATE: "Category Certificate",
  INCOME_CERTIFICATE: "Income Certificate",
}

export const REQUIRED_DOCUMENTS: DocumentType[] = [
  "CLASS_10_MARKSHEET",
  "CLASS_12_MARKSHEET",
  "PHOTO",
  "SIGNATURE",
  "IDENTITY_PROOF",
  "ADDRESS_PROOF",
]

export const OPTIONAL_DOCUMENTS: DocumentType[] = ["JEE_MAINS_SCORECARD", "CATEGORY_CERTIFICATE", "INCOME_CERTIFICATE"]
