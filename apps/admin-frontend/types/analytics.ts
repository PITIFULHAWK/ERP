export interface SystemMetrics {
  totalUsers: number
  totalUniversities: number
  totalCourses: number
  totalApplications: number
  pendingApplications: number
  verifiedApplications: number
  rejectedApplications: number
  monthlyGrowth: {
    users: number
    applications: number
    universities: number
  }
}

export interface ApplicationAnalytics {
  statusDistribution: {
    status: string
    count: number
    percentage: number
  }[]
  monthlyTrends: {
    month: string
    submitted: number
    verified: number
    rejected: number
  }[]
  processingTimes: {
    average: number
    median: number
    fastest: number
    slowest: number
  }
}

export interface UserAnalytics {
  roleDistribution: {
    role: string
    count: number
    percentage: number
  }[]
  verificationStatus: {
    verified: number
    unverified: number
  }
  monthlyRegistrations: {
    month: string
    count: number
  }[]
}

export interface UniversityAnalytics {
  topUniversities: {
    id: string
    name: string
    studentCount: number
    courseCount: number
    applicationCount: number
  }[]
  enrollmentTrends: {
    month: string
    enrollments: number
  }[]
}

export interface CourseAnalytics {
  popularCourses: {
    id: string
    name: string
    enrollmentCount: number
    completionRate: number
  }[]
  enrollmentByCategory: {
    category: string
    count: number
  }[]
}

export interface FinancialReport {
  totalRevenue: number
  monthlyRevenue: {
    month: string
    amount: number
  }[]
  feeCollection: {
    collected: number
    pending: number
    overdue: number
  }
  universityWiseRevenue: {
    universityName: string
    amount: number
  }[]
}
