export interface CreateUniversityRequest {
    name: string;
    uid: number;
}

export interface CreateCourseRequest {
    name: string;
    code: string;
    credits: number;
    totalSemester: number;
    totalFees: number;
    universityId: string;
}

export interface CreateHostelRequest {
    name: string;
    fees: number;
    totalCapacity: number;
    type: "AC" | "NON_AC";
    universityId: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    role?: "USER" | "STUDENT" | "PROFESSOR" | "ADMIN" | "VERIFIER";
    universityId: string;
}

export interface CreateApplicationRequest {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    nationality: string;
    phoneNumber: string;
    alternatePhoneNumber?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    class10Percentage: number;
    class10Board: string;
    class10YearOfPassing: number;
    class12Percentage: number;
    class12Board: string;
    class12YearOfPassing: number;
    class12Stream: string;
    hasJeeMainsScore?: boolean;
    jeeMainsScore?: number;
    jeeMainsRank?: number;
    jeeMainsYear?: number;
    preferredCourseId: string;
    userId: string;
}

export interface CreateDocumentRequest {
    type:
        | "CLASS_10_MARKSHEET"
        | "CLASS_12_MARKSHEET"
        | "JEE_MAINS_SCORECARD"
        | "PHOTO"
        | "SIGNATURE"
        | "IDENTITY_PROOF"
        | "ADDRESS_PROOF"
        | "CATEGORY_CERTIFICATE"
        | "INCOME_CERTIFICATE";
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    applicationId: string;
}

export interface VerifyApplicationRequest {
    status: "VERIFIED" | "REJECTED" | "UNDER_REVIEW" | "INCOMPLETE";
    verificationNotes?: string;
    rejectionReason?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface CreatePaymentRequest {
    userId: string;
    type: "COURSE" | "HOSTEL";
    courseId?: string;
    hostelId?: string;
    amount: number;
    currency?: string;
    method?: "MANUAL" | "RAZORPAY" | "CARD" | "UPI";
    reference?: string;
    notes?: string;
}

export interface CreateReceiptRequest {
    paymentId: string;
    uploadedById: string;
    mediaUrl: string;
    mediaType: string;
    notes?: string;
}

export interface VerifyPaymentRequest {
    verified: boolean;
    adminId: string;
}

export interface CreateExamRequest {
    name: string;
    type: "MID_TERM" | "FINAL_EXAM" | "QUIZ" | "PRACTICAL";
    examDate: string;
    maxMarks: number;
    semesterId: string;
}

export interface CreateSubjectRequest {
    name: string;
    code: string;
    credits: number;
    semesterId: string;
}

export interface CreateExamResultRequest {
    studentId: string;
    totalMarksObtained?: number;
    percentage?: number;
    status: "PASS" | "FAIL" | "PENDING" | "WITHHELD";
    remarks?: string;
    grade?: number;
}

export interface CreateGradeRequest {
    examResultId: string;
    marksObtained: number;
}
