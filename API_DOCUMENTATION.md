# ERP System API Documentation

## Overview
This document provides comprehensive documentation for all API endpoints in the ERP system, including academic management, user management, applications, payments, and administrative features.

### Recent Updates
- **Enhanced Resource Management**: Added comprehensive admin endpoints for resource management with section-based organization
- **Section-Based Filtering**: Resources can now be filtered and organized by sections instead of individual course/semester combinations
- **Improved Resource Types**: Updated resource type mapping between frontend and backend for better consistency

## Base URL
```
/api
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    // Error details (optional)
  }
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

# API Endpoints

## Health Check
```
GET /api/health
```
**Description:** Check API health status

---

## Academic Management

### Section Management

#### Create Section
```
POST /api/sections
```
**Body:**
```json
{
  "name": "Section A",
  "code": "A", 
  "description": "Morning batch for Computer Science",
  "courseId": "course-uuid",
  "semesterId": "semester-uuid",
  "academicYearId": "academic-year-uuid",
  "maxStudents": 60
}
```

#### Get All Sections (Admin View)
```
GET /api/sections
```
**Query Parameters:**
- `universityId` (optional)
- `courseId` (optional)
- `semesterId` (optional)
- `academicYearId` (optional)

#### Assign Student to Section
```
POST /api/sections/assign-student
```
**Body:**
```json
{
  "studentId": "student-uuid",
  "sectionId": "section-uuid"
}
```

#### Get Student's Sections
```
GET /api/sections/student/:studentId
```

#### Assign Professor to Section
```
POST /api/sections/assign-professor
```
**Body:**
```json
{
  "professorId": "professor-uuid",
  "sectionId": "section-uuid",
  "subjectId": "subject-uuid",
  "assignmentType": "INSTRUCTOR"
}
```

#### Get Professor's Sections
```
GET /api/sections/professor/:professorId
```

### Attendance Management

#### Mark Attendance (Professor)
```
POST /api/attendance/mark
```
**Body:**
```json
{
  "professorId": "professor-uuid",
  "sectionId": "section-uuid", 
  "subjectId": "subject-uuid",
  "date": "2024-09-15",
  "classType": "REGULAR",
  "attendanceData": [
    {
      "studentId": "student-uuid-1",
      "status": "PRESENT"
    },
    {
      "studentId": "student-uuid-2", 
      "status": "ABSENT"
    }
  ]
}
```

#### Get Student Attendance
```
GET /api/attendance/student/:studentId
```
**Query Parameters:**
- `subjectId` (optional)
- `semesterId` (optional)
- `academicYearId` (optional)

#### Get Section Attendance
```
GET /api/attendance/section/:sectionId
```
**Query Parameters:**
- `subjectId` (optional)
- `date` (optional)
- `academicYearId` (optional)

#### Get Section Attendance Statistics
```
GET /api/attendance/section/:sectionId/stats
```
**Query Parameters:**
- `academicYearId` (optional)
- `subjectId` (optional)

### Academic Calendar Management

**Note:** Academic calendar system uses a simplified PDF-only approach. Each academic year can have one PDF document containing all calendar information.

#### Upload Academic Calendar PDF
```
POST /api/academic-calendar/upload
```
**Body:** (multipart/form-data)
```
academicYearId: "academic-year-uuid"
calendarPdf: <PDF file>
```

#### Get Calendar PDF
```
GET /api/academic-calendar/:academicYearId
```

#### Remove Calendar PDF
```
DELETE /api/academic-calendar/:academicYearId
```

#### Get Academic Years with Calendar Status
```
GET /api/academic-calendar/
```

#### Get Student Calendar
```
GET /api/academic-calendar/student/:studentId
```

### Resource Management

#### Admin Resource Endpoints
```
GET /api/resources                    # Get all resources (with filters)
POST /api/resources                   # Create resource
GET /api/resources/:id                # Get specific resource
PATCH /api/resources/:id              # Update resource
DELETE /api/resources/:id             # Delete resource
GET /api/resources/stats              # Get resource statistics
POST /api/resources/:id/upload        # Upload file
GET /api/resources/:id/download       # Download resource
```

#### Professor Resource Endpoints
```
POST /api/resources/share             # Share resource with section
GET /api/resources/professor/:id      # Get professor's resources
GET /api/resources/professor/:id/stats # Get professor's statistics
PATCH /api/resources/:resourceId      # Update shared resource
DELETE /api/resources/:resourceId     # Delete shared resource
```

#### Student Resource Endpoints
```
GET /api/resources/student/:id        # Get student's accessible resources
POST /api/resources/:id/download      # Track resource download
```

**Resource Types:** PDF, VIDEO, AUDIO, IMAGE, DOCUMENT, LINK, OTHER

**Query Parameters for Filtering:**
- `type` - Resource type filter
- `sectionId` - Filter by section
- `subjectId` - Filter by subject  
- `isPublic` - Visibility filter
- `search` - Text search in title/description
```

---

## Core System

### User Management

#### User Registration
```
POST /api/users/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "phoneNumber": "1234567890"
}
```

#### User Login
```
POST /api/users/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (Student):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT",
      "university": { ... },
      "coursesOpted": [ ... ],
      "hostelOpted": { ... },
      "application": { ... },
      "enrollments": [ ... ],
      "currentSemesterInfo": {
        "currentSemester": 3,
        "semesterInfo": { ... },
        "academicYear": { ... },
        "course": { ... },
        "enrollmentStatus": "ACTIVE",
        "cgpa": 3.75
      },
      "cgpa": 3.75,
      "academicRecord": { ... }
    }
  }
}
```

**Response (Non-Student):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "PROFESSOR",
      "university": { ... },
      "coursesOpted": [ ... ],
      "hostelOpted": { ... },
      "application": { ... },
      "enrollments": [ ... ],
      "currentSemesterInfo": null,
      "cgpa": 0,
      "academicRecord": null
    }
  }
}
```

#### User Logout
```
POST /api/users/logout
```

#### Get User Profile
```
GET /api/users/profile
```
**Description:** Get current authenticated user's profile with calculated CGPA (for students)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "university": { ... },
    "cgpa": 3.75,
    "academicRecord": {
      "cgpa": 3.75,
      "semesterPerformance": [
        {
          "semester": { "id": "sem1", "number": 1, "code": "SEM1" },
          "gpa": 3.8
        }
      ]
    }
  }
}
```

#### Update User Profile
```
PUT /api/users/profile
```
**Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

#### Get User Profile
```
GET /api/users/profile
```

#### Update User Profile
```
PUT /api/users/profile
```

#### Get All Users (Admin)
```
GET /api/users
```

#### Update User (Profile Update)
```
PATCH /api/users/:id
```
**Description:** Update user profile information. Users can only update their own profiles unless they are admin.

**Body:**
```json
{
  "firstName": "Updated First Name",
  "lastName": "Updated Last Name",
  "email": "updated@example.com",
  "phoneNumber": "+1234567890",
  "address": "Updated Address"
}
```

#### Delete User (Admin Only)
```
DELETE /api/users/:id
```
**Description:** Permanently delete a user account. Admin access required.

#### Update User Role (Admin Only)
```
PATCH /api/users/:id/role
```
**Description:** Update user's role in the system. Admin access required.

**Body:**
```json
{
  "role": "PROFESSOR"
}
```
**Allowed roles:** STUDENT, PROFESSOR, VERIFIER, ADMIN

#### Update Current Semester (Student/Admin)
```
PATCH /api/users/:studentId/current-semester
```
**Description:** Update a student's current semester. Students can only update their own semester.

**Body:**
```json
{
  "currentSemester": 3
}
```

#### Get Current Semester (Student/Admin/Professor)
```
GET /api/users/:studentId/current-semester
```
**Description:** Get current semester information for a student. Students can only access their own data.

**Response:**
```json
{
  "success": true,
  "data": {
    "currentSemester": 3,
    "semesterInfo": {
      "id": "semester-uuid",
      "number": 3,
      "code": "SEM3",
      "course": {
        "id": "course-uuid",
        "name": "Computer Science",
        "code": "CS",
        "totalSemester": 8
      }
    },
    "academicYear": {
      "id": "year-uuid",
      "year": "2024-2025",
      "isActive": true
    },
    "course": {
      "id": "course-uuid",
      "name": "Computer Science",
      "code": "CS",
      "totalSemester": 8
    },
    "enrollmentStatus": "ACTIVE",
    "totalCredits": 90,
    "completedCredits": 60,
    "cgpa": 3.75,
    "enrollmentDate": "2022-08-15T00:00:00.000Z"
  }
}
```

#### Get Semester Progress (Student/Admin/Professor)
```
GET /api/users/:studentId/semester-progress
```
**Description:** Get detailed semester progression for a student. Students can only access their own data.

**Response:**
```json
{
  "success": true,
  "data": {
    "currentSemester": 3,
    "totalSemesters": 8,
    "progressPercentage": 37,
    "activeEnrollment": {
      "id": "enrollment-uuid",
      "currentSemester": 3,
      "status": "ACTIVE",
      "cgpa": 3.75,
      "totalCredits": 90,
      "completedCredits": 60
    },
    "allEnrollments": [
      {
        "id": "enrollment-uuid",
        "currentSemester": 3,
        "status": "ACTIVE",
        "semester": { ... },
        "academicYear": { ... },
        "course": { ... }
      }
    ]
  }
}
```

#### Update Current Semester (Admin/Professor)
```
PATCH /api/users/:studentId/current-semester
```
**Description:** Update a student's current semester. Only admins and professors can perform this action.

**Body:**
```json
{
  "currentSemester": 4
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student semester updated successfully",
  "data": {
    "id": "enrollment-uuid",
    "currentSemester": 4,
    "status": "ACTIVE",
    "semester": { ... },
    "academicYear": { ... },
    "course": { ... }
  }
}
```

### University Management

#### Get All Universities
```
GET /api/universities
```

#### Get University by ID
```
GET /api/universities/:id
```

#### Create University (Admin)
```
POST /api/universities
```
**Body:**
```json
{
  "name": "University Name",
  "code": "UNIV",
  "description": "University Description",
  "address": "University Address",
  "phone": "1234567890",
  "email": "contact@university.edu"
}
```

#### Update University (Admin)
```
PUT /api/universities/:id
```

#### Delete University (Admin)
```
DELETE /api/universities/:id
```

### Course Management

#### Get All Courses
```
GET /api/courses
```

#### Get Course by ID
```
GET /api/courses/:id
```

#### Create Course (Admin)
```
POST /api/courses
```

#### Update Course (Admin)
```
PATCH /api/courses/:id
```

#### Delete Course (Admin)
```
DELETE /api/courses/:id
```

#### Enroll Student in Course (Admin/Staff)
```
PATCH /api/courses/:courseId/enroll-student/:userId
```
**Description:** Enroll a student in a course based on their verified application. Creates a StudentEnrollment record and promotes user to STUDENT role.

**Requirements:**
- User must have role "USER"
- User must have a verified application for the specified course
- Application status must be "VERIFIED"

**Response:**
```json
{
  "success": true,
  "message": "User John Doe successfully enrolled and promoted to STUDENT based on verified application.",
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT",
      "enrollments": [
        {
          "id": "enrollment-uuid",
          "currentSemester": 1,
          "status": "ACTIVE",
          "course": { ... },
          "semester": { ... },
          "academicYear": { ... }
        }
      ]
    },
    "course": {
      "id": "course-uuid",
      "currentStudents": 45
    },
    "enrollment": {
      "id": "enrollment-uuid",
      "currentSemester": 1,
      "status": "ACTIVE",
      "enrollmentDate": "2024-09-15T10:00:00Z"
    },
    "applicationId": "application-uuid",
    "enrollmentDate": "2024-09-15T10:00:00Z"
  }
}
```

### Application Management

#### Get All Applications (Admin)
```
GET /api/applications
```

#### Get User Applications
```
GET /api/applications/user/:userId
```

#### Submit Application
```
POST /api/applications
```

#### Update Application
```
PUT /api/applications/:id
```

#### Delete Application
```
DELETE /api/applications/:id
```

#### Update Application Status (Admin)
```
PATCH /api/applications/:id/status
```

### Hostel Management

#### Get All Hostels
```
GET /api/hostels
```

#### Get Hostel by ID
```
GET /api/hostels/:id
```

#### Create Hostel (Admin)
```
POST /api/hostels
```

#### Update Hostel (Admin)
```
PATCH /api/hostels/:id
```

#### Assign Student to Hostel (Admin)
```
PATCH /api/hostels/:id/assign
```

#### Delete Hostel (Admin)
```
DELETE /api/hostels/:id
```

### Payment Management

#### Get All Payments (Admin)
```
GET /api/payments
```

#### Get Payment Summary
```
GET /api/payments/summary
```

#### Get Payment by ID
```
GET /api/payments/:id
```

#### Create Payment
```
POST /api/payments
```

#### Delete Payment
```
DELETE /api/payments/:id
```

#### Upload Payment Receipt
```
POST /api/payments/receipts
```

#### Verify Payment (Admin)
```
PATCH /api/payments/:id/verify
```

### Notice Management

#### Get All Notices
```
GET /api/notice
```

#### Get Notice by ID
```
GET /api/notice/:id
```

#### Create Notice (Admin)
```
POST /api/notice
```

#### Update Notice (Admin)
```
PUT /api/notice/:id
```

#### Delete Notice (Admin)
```
DELETE /api/notice/:id
```

### Exam Management

#### Get All Exams
```
GET /api/exams
```

#### Get Exam by ID
```
GET /api/exams/:id
```

#### Create Exam (Admin)
```
POST /api/exams
```

#### Update Exam (Admin)
```
PUT /api/exams/:id
```

#### Delete Exam (Admin)
```
DELETE /api/exams/:id
```

#### Create Exam Result
```
POST /api/exams/:examId/results
```
**Body:**
```json
{
  "studentId": "student-uuid",
  "totalMarksObtained": 85,
  "percentage": 85.0,
  "status": "PASS",
  "remarks": "Good performance",
  "grade": 3.5
}
```

#### Get Exam Results
```
GET /api/exams/:examId/results
```
**Description:** Get all results for a specific exam

### Subject Management

#### Get All Subjects
```
GET /api/subjects
```

#### Get Subject by ID
```
GET /api/subjects/:id
```

#### Create Subject (Admin)
```
POST /api/subjects
```

#### Update Subject (Admin)
```
PUT /api/subjects/:id
```

#### Delete Subject (Admin)
```
DELETE /api/subjects/:id
```

### Semester Management

#### Get All Semesters
```
GET /api/semesters
```

#### Get Semester by ID
```
GET /api/semesters/:id
```

#### Create Semester (Admin)
```
POST /api/semesters
```

#### Update Semester (Admin)
```
PUT /api/semesters/:id
```

#### Delete Semester (Admin)
```
DELETE /api/semesters/:id
```

### Placement Management

#### Get All Placements
```
GET /api/placements
```

**Query Parameters:**
- `status` (optional): Filter by placement status (`ACTIVE`, `CLOSED`, `DRAFT`)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "data": {
    "placements": [
      {
        "id": "placement-uuid",
        "title": "Software Engineer",
        "description": "Join our development team...",
        "companyName": "Tech Corp",
        "position": "Software Developer",
        "packageOffered": "8-12 LPA",
        "cgpaCriteria": 7.5,
        "location": "Bangalore",
        "applicationDeadline": "2025-12-31T23:59:59.000Z",
        "status": "ACTIVE",
        "createdAt": "2025-09-16T10:00:00.000Z",
        "updatedAt": "2025-09-16T10:00:00.000Z",
        "createdById": "admin-user-uuid",
        "emailsSent": 25
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

#### Get Placement by ID
```
GET /api/placements/:id
```

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "placement-uuid",
    "title": "Software Engineer",
    "description": "Join our development team...",
    "companyName": "Tech Corp",
    "position": "Software Developer",
    "packageOffered": "8-12 LPA",
    "cgpaCriteria": 7.5,
    "location": "Bangalore",
    "applicationDeadline": "2025-12-31T23:59:59.000Z",
    "status": "ACTIVE",
    "createdAt": "2025-09-16T10:00:00.000Z",
    "updatedAt": "2025-09-16T10:00:00.000Z",
    "createdById": "admin-user-uuid",
    "emailsSent": 25
  }
}
```

#### Create Placement (Admin)
```
POST /api/placements
```

**Authentication:** Required (Bearer token) + Admin role

**Request Body:**
```json
{
  "title": "Software Engineer",
  "description": "Join our development team as a software engineer...",
  "companyName": "Tech Corp",
  "position": "Software Developer",
  "packageOffered": "8-12 LPA",
  "cgpaCriteria": 7.5,
  "location": "Bangalore",
  "applicationDeadline": "2025-12-31T23:59:59.000Z"
}
```

**Required Fields:**
- `title` (string)
- `description` (string) 
- `companyName` (string)
- `position` (string)

**Optional Fields:**
- `packageOffered` (string)
- `cgpaCriteria` (number)
- `location` (string)
- `applicationDeadline` (ISO date string)

**Response:**
```json
{
  "success": true,
  "message": "Placement created successfully",
  "data": {
    "id": "new-placement-uuid",
    "title": "Software Engineer",
    "description": "Join our development team...",
    "companyName": "Tech Corp",
    "position": "Software Developer",
    "packageOffered": "8-12 LPA",
    "cgpaCriteria": 7.5,
    "location": "Bangalore",
    "applicationDeadline": "2025-12-31T23:59:59.000Z",
    "status": "DRAFT",
    "createdAt": "2025-09-16T10:00:00.000Z",
    "updatedAt": "2025-09-16T10:00:00.000Z",
    "createdById": "admin-user-uuid",
    "emailsSent": 0
  }
}
```

#### Update Placement (Admin)
```
PUT /api/placements/:id
```

**Authentication:** Required (Bearer token) + Admin role

**Request Body:** (All fields optional for partial updates)
```json
{
  "title": "Senior Software Engineer",
  "description": "Updated description...",
  "companyName": "Tech Corp",
  "position": "Senior Software Developer",
  "packageOffered": "10-15 LPA",
  "cgpaCriteria": 8.0,
  "location": "Mumbai",
  "applicationDeadline": "2025-12-31T23:59:59.000Z",
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Placement updated successfully",
  "data": {
    "id": "placement-uuid",
    "title": "Senior Software Engineer",
    "description": "Updated description...",
    "companyName": "Tech Corp",
    "position": "Senior Software Developer",
    "packageOffered": "10-15 LPA",
    "cgpaCriteria": 8.0,
    "location": "Mumbai",
    "applicationDeadline": "2025-12-31T23:59:59.000Z",
    "status": "ACTIVE",
    "createdAt": "2025-09-16T10:00:00.000Z",
    "updatedAt": "2025-09-16T11:00:00.000Z",
    "createdById": "admin-user-uuid",
    "emailsSent": 0
  }
}
```

#### Delete Placement (Admin)
```
DELETE /api/placements/:id
```

**Authentication:** Required (Bearer token) + Admin role

**Response:**
```json
{
  "success": true,
  "message": "Placement deleted successfully"
}
```

#### Get Eligible Users Count
```
GET /api/placements/:id/eligible-count
```

**Authentication:** Required (Bearer token)

**Description:** Returns the count of students eligible for a placement based on CGPA criteria.

**Response:**
```json
{
  "success": true,
  "data": {
    "placementId": "placement-uuid",
    "placementTitle": "Software Engineer",
    "cgpaCriteria": 7.5,
    "eligibleUsersCount": 42
  }
}
```

#### Send Placement Notification (Admin)
```
POST /api/placements/:id/notify
```

**Authentication:** Required (Bearer token) + Admin role

**Description:** Sends email notifications to all students eligible for the placement (based on CGPA criteria). Only works for placements with status "ACTIVE".

**Response:**
```json
{
  "success": true,
  "message": "Placement notification sent successfully",
  "data": {
    "placementTitle": "Software Engineer",
    "eligibleUsersFound": 42,
    "emailsSent": 42,
    "cgpaCriteria": 7.5,
    "recipients": [
      {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "cgpa": 8.2
      },
      {
        "name": "Jane Smith", 
        "email": "jane.smith@example.com",
        "cgpa": 7.8
      }
    ]
  }
}
```

#### Get Placement Statistics
```
GET /api/placements/stats
```

**Authentication:** Required (Bearer token)

**Description:** Returns aggregated statistics about all placements in the system.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPlacements": 25,
    "activePlacements": 8,
    "closedPlacements": 17,
    "totalEmailsSent": 1250
  }
}
```

### Placement Data Model

#### Placement Status
- `ACTIVE` - Placement is currently accepting applications
- `CLOSED` - Placement is closed for applications
- `DRAFT` - Placement is in draft state (not visible to students)

#### CGPA Filtering
The system automatically filters eligible students based on the `cgpaCriteria` field:
- If `cgpaCriteria` is set, only students with CGPA >= criteria are eligible
- If `cgpaCriteria` is null or 0, all students are eligible
- CGPA is retrieved from the student's latest enrollment record
- Students without enrollment records or CGPA are excluded from CGPA-based filtering

#### Email Notifications
- Email notifications are queued using the email service
- Only students with role "STUDENT" receive notifications
- The system tracks the number of emails sent per placement
- Emails include placement details and student's CGPA information

---

## Data Models & Relationships

### User Roles
- `PENDING` - Newly registered user
- `STUDENT` - Student user
- `PROFESSOR` - Faculty member
- `ADMIN` - Administrator
- `REJECTED` - Rejected application

### Attendance Status
- `PRESENT` - Student attended class
- `ABSENT` - Student did not attend

### Resource Types
- `NOTES` - Lecture notes
- `ASSIGNMENT` - Assignment files
- `SLIDES` - Presentation slides
- `READING` - Reading materials
- `OTHER` - Other resources

### Exam Result Status
- `PASS` - Student passed the exam
- `FAIL` - Student failed the exam
- `PENDING` - Results pending
- `WITHHELD` - Results withheld

### CGPA Calculation
- **Calculated dynamically** from exam results using credit-weighted average
- **Grade Scale**: 90-100% = 4.0, 80-89% = 3.0, 70-79% = 2.0, 60-69% = 1.0, <60% = 0.0
- **Formula**: `(Sum of (Grade Points × Credits)) / (Total Credits)`
- **Only includes**: Exams with "PASS" status

### Application Status
- `PENDING` - Under review
- `APPROVED` - Accepted
- `REJECTED` - Declined
- `WITHDRAWN` - Cancelled by applicant

---

## Authentication & Authorization

### Role-Based Access Control

#### Students
- Can view their own sections, attendance, and resources
- Can download shared resources
- Can view calculated CGPA and academic records
- Cannot modify academic data

#### Professors
- Can view assigned sections
- Can mark attendance for their sections (PRESENT/ABSENT only)
- Can share resources with their sections
- Can view attendance statistics for their sections

#### Admins
- Full access to all endpoints
- Can manage users, sections, and assignments
- Can view system-wide statistics
- Can manage academic calendar (PDF upload/download)
- Can create exams and manage results

### Key Features

#### Dynamic CGPA Calculation
- **Real-time calculation** based on exam results
- **Credit-weighted averaging** using subject credit hours
- **Grade point conversion** (4.0 scale)
- **Semester-wise GPA** tracking
- **Academic record** with performance breakdown

#### Simplified Attendance System
- **Two status options**: PRESENT or ABSENT
- **Professor marking**: Easy interface for attendance
- **Student viewing**: Clear attendance percentage
- **Statistics**: Present vs absent ratios

#### Academic Calendar
- **PDF-based system**: Single PDF per academic year
- **Simple upload/download**: Easy management
- **Student access**: View relevant academic calendar

---

## Error Handling

### Common Error Responses

#### Authentication Errors
```json
{
  "success": false,
  "message": "Access token required",
  "error": "AUTHENTICATION_REQUIRED"
}
```

#### Authorization Errors
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "error": "AUTHORIZATION_FAILED"
}
```

#### Validation Errors
```json
{
  "success": false,
  "message": "Invalid input data",
  "error": {
    "field": "email",
    "message": "Valid email is required"
  }
}
```

#### Not Found Errors
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "RESOURCE_NOT_FOUND"
}
```

---

## Resource Management

The resource management system enables both administrators and professors to manage educational resources. Administrators can create general resources for testing and management purposes, while professors can share educational materials with their assigned sections.

### Admin Resource Management

#### Get All Resources (Admin)
```
GET /api/resources
```
**Description:** Retrieve all resources in the system with filtering options.

**Query Parameters:**
- `type` (optional) - Filter by resource type (PDF, VIDEO, AUDIO, etc.)
- `sectionId` (optional) - Filter by specific section
- `subjectId` (optional) - Filter by specific subject
- `isPublic` (optional) - Filter by visibility (true/false)
- `search` (optional) - Search in title and description

**Response:**
```json
{
  "success": true,
  "message": "Resources retrieved successfully",
  "data": [
    {
      "id": "resource-uuid",
      "title": "General Study Guide",
      "description": "Comprehensive study material",
      "type": "PDF",
      "fileUrl": "https://example.com/guide.pdf",
      "fileSize": 2048576,
      "isPublic": true,
      "uploadedBy": {
        "id": "admin-uuid",
        "firstName": "Admin",
        "lastName": "User",
        "role": "ADMIN"
      },
      "section": {
        "id": "section-uuid",
        "name": "Section A",
        "code": "A"
      },
      "subject": {
        "id": "subject-uuid",
        "name": "Mathematics",
        "code": "MATH101"
      },
      "downloads": 45,
      "views": 120,
      "createdAt": "2024-09-15T10:00:00Z"
    }
  ]
}
```

#### Create Resource (Admin)
```
POST /api/resources
```
**Description:** Create a new resource for testing or general purposes.

**Body:**
```json
{
  "title": "Study Guide",
  "description": "Comprehensive study material for final exams",
  "type": "PDF",
  "externalUrl": "https://example.com/guide.pdf",
  "sectionId": "section-uuid",
  "subjectId": "subject-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    "id": "resource-uuid"
  }
}
```

#### Update Resource (Admin)
```
PATCH /api/resources/:id
```
**Description:** Update resource information.

**Body:**
```json
{
  "title": "Updated Study Guide",
  "description": "Updated comprehensive study material",
  "type": "PDF",
  "externalUrl": "https://example.com/updated-guide.pdf",
  "sectionId": "new-section-uuid",
  "subjectId": "new-subject-uuid"
}
```

#### Delete Resource (Admin)
```
DELETE /api/resources/:id
```
**Description:** Delete a resource from the system.

#### Get Resource Statistics (Admin)
```
GET /api/resources/stats
```
**Description:** Get system-wide resource statistics.

**Response:**
```json
{
  "success": true,
  "message": "Resource statistics retrieved successfully",
  "data": {
    "totalResources": 150,
    "totalDownloads": 2350,
    "totalViews": 5680,
    "resourcesByType": [
      {
        "type": "PDF",
        "count": 85
      },
      {
        "type": "VIDEO",
        "count": 32
      },
      {
        "type": "AUDIO",
        "count": 15
      }
    ]
  }
}
```

#### Upload Resource File (Admin)
```
POST /api/resources/:id/upload
```
**Description:** Upload a file for a resource.

**Body:** (multipart/form-data)
```
file: <uploaded file>
```

#### Download Resource (Admin)
```
GET /api/resources/:id/download
```
**Description:** Get download link for a resource.

### Professor Resource Management

#### Share Resource (Professor)
```
POST /api/resources/share
```
**Description:** Professors can share educational resources with their assigned sections.

**Body:**
```json
{
  "title": "Week 1 Lecture Notes",
  "description": "Introduction to Database Management Systems",
  "resourceType": "NOTES",
  "fileUrl": "https://example.com/week1-notes.pdf",
  "fileName": "DBMS_Week1_Notes.pdf",
  "fileSize": 2048576,
  "professorId": "professor-uuid",
  "sectionId": "section-uuid",
  "subjectId": "subject-uuid",
  "isPinned": false
}
```

#### Get Resources for Student
```
GET /api/resources/student/:studentId
```
**Description:** Students can view resources shared with their sections.

**Query Parameters:**
- `subjectId` (optional) - Filter by specific subject
- `resourceType` (optional) - Filter by resource type
- `sectionId` (optional) - Filter by specific section

#### Get Resources for Professor
```
GET /api/resources/professor/:professorId
```
**Description:** Professors can view resources they have shared.

**Query Parameters:**
- `sectionId` (optional) - Filter by specific section
- `subjectId` (optional) - Filter by specific subject

#### Update Resource (Professor)
```
PATCH /api/resources/:resourceId
```
**Description:** Update resource details like title, description, or visibility.

#### Delete Resource (Professor)
```
DELETE /api/resources/:resourceId
```
**Description:** Remove a shared resource.

#### Track Resource Download
```
POST /api/resources/:resourceId/download
```
**Description:** Track when a student downloads a resource for analytics.

#### Get Resource Statistics (Professor)
```
GET /api/resources/professor/:professorId/stats
```
**Description:** Get download statistics and engagement metrics for shared resources.

### Resource Types (Frontend)
- `PDF` - PDF documents and study materials
- `VIDEO` - Video lectures and tutorials
- `AUDIO` - Audio recordings and podcasts
- `IMAGE` - Images, diagrams, and charts
- `DOCUMENT` - Word documents and text files
- `LINK` - External links and web resources
- `OTHER` - Other educational materials

### Resource Types (Backend Mapping)
- `NOTES` - Lecture notes and study materials
- `ASSIGNMENT` - Assignment documents and instructions
- `SLIDES` - Presentation slides
- `HANDOUT` - Handout materials
- `REFERENCE` - Reference materials and additional reading
- `VIDEO` - Video lectures and tutorials
- `AUDIO` - Audio recordings
- `LINK` - External links
- `ANNOUNCEMENT` - Announcements and notices
- `SYLLABUS` - Course syllabus
- `OTHER` - Other educational materials

---

## Complaint Management

The complaint management system allows students to raise complaints about various issues (hostel, academic, infrastructure, etc.) and enables administrators to track, assign, and resolve these complaints efficiently.

### Complaint Categories
- `HOSTEL` - Hostel-related issues
- `ACADEMIC` - Academic/course issues  
- `INFRASTRUCTURE` - Building, facilities, equipment
- `FOOD` - Mess/cafeteria issues
- `TRANSPORT` - Bus/transport related
- `LIBRARY` - Library issues
- `MEDICAL` - Health center issues
- `FINANCIAL` - Fee/payment issues
- `ADMINISTRATIVE` - Documentation, certificates, etc.
- `DISCIPLINARY` - Student conduct issues
- `TECHNICAL` - IT/computer/network issues
- `OTHER` - Other miscellaneous issues

### Complaint Status
- `OPEN` - Newly raised, not yet reviewed
- `IN_PROGRESS` - Being worked on
- `PENDING_INFO` - Waiting for more info from student
- `RESOLVED` - Issue has been resolved
- `CLOSED` - Complaint closed (resolved or dismissed)
- `ESCALATED` - Escalated to higher authority

### Complaint Priority
- `LOW` - Non-urgent issues
- `MEDIUM` - Standard priority (default)
- `HIGH` - Important issues requiring prompt attention
- `CRITICAL` - Urgent issues requiring immediate attention

#### Create Complaint (Student)
```
POST /api/complaints
```
**Description:** Students can raise new complaints about various issues.

**Body:**
```json
{
  "title": "Hostel Room AC Not Working",
  "description": "The air conditioning unit in room 205, Block A has not been working for the past 3 days. It's very hot and uncomfortable to stay in the room.",
  "category": "HOSTEL",
  "priority": "HIGH",
  "location": "Room 205, Block A",
  "urgency": true,
  "attachmentUrls": ["https://example.com/ac-photo.jpg"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Complaint raised successfully",
  "data": {
    "id": "complaint-uuid",
    "title": "Hostel Room AC Not Working",
    "description": "The air conditioning unit in room 205...",
    "category": "HOSTEL",
    "priority": "HIGH",
    "status": "OPEN",
    "location": "Room 205, Block A",
    "urgency": true,
    "studentId": "student-uuid",
    "student": {
      "id": "student-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-09-15T10:00:00Z",
    "updatedAt": "2024-09-15T10:00:00Z"
  }
}
```

#### Get All Complaints
```
GET /api/complaints
```
**Description:** Get complaints with filtering and pagination. Students see only their complaints, admin/staff see all.

**Query Parameters:**
- `status` (optional) - Filter by complaint status
- `category` (optional) - Filter by complaint category
- `priority` (optional) - Filter by priority level
- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 10) - Number of items per page
- `sortBy` (optional, default: "createdAt") - Sort field
- `sortOrder` (optional, default: "desc") - Sort order (asc/desc)

**Example:** `GET /api/complaints?status=OPEN&category=HOSTEL&page=1&limit=5`

**Response:**
```json
{
  "success": true,
  "message": "Complaints retrieved successfully",
  "data": {
    "complaints": [
      {
        "id": "complaint-uuid",
        "title": "Hostel Room AC Not Working",
        "description": "The air conditioning unit...",
        "category": "HOSTEL",
        "priority": "HIGH",
        "status": "OPEN",
        "location": "Room 205, Block A",
        "urgency": true,
        "student": {
          "id": "student-uuid",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "assignedAdmin": null,
        "resolver": null,
        "_count": {
          "updates": 1
        },
        "createdAt": "2024-09-15T10:00:00Z",
        "updatedAt": "2024-09-15T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### Get Complaint by ID
```
GET /api/complaints/:id
```
**Description:** Get detailed complaint information including all updates. Students can only view their own complaints.

**Response:**
```json
{
  "success": true,
  "message": "Complaint retrieved successfully",
  "data": {
    "id": "complaint-uuid",
    "title": "Hostel Room AC Not Working",
    "description": "The air conditioning unit in room 205...",
    "category": "HOSTEL",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "location": "Room 205, Block A",
    "urgency": true,
    "resolutionNote": null,
    "adminNotes": "Assigned to maintenance team",
    "student": {
      "id": "student-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "assignedAdmin": {
      "id": "admin-uuid",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "resolver": null,
    "updates": [
      {
        "id": "update-uuid",
        "updateType": "COMMENT",
        "message": "Complaint raised",
        "isInternal": false,
        "createdAt": "2024-09-15T10:00:00Z",
        "updater": {
          "id": "student-uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "STUDENT"
        }
      },
      {
        "id": "update-uuid-2",
        "updateType": "ASSIGNMENT",
        "message": "Status changed to IN_PROGRESS and assigned to admin",
        "isInternal": false,
        "createdAt": "2024-09-15T11:00:00Z",
        "updater": {
          "id": "admin-uuid",
          "name": "Admin User",
          "email": "admin@example.com",
          "role": "ADMIN"
        }
      }
    ],
    "createdAt": "2024-09-15T10:00:00Z",
    "updatedAt": "2024-09-15T11:00:00Z"
  }
}
```

#### Update Complaint Status (Admin/Staff)
```
PATCH /api/complaints/:id/status
```
**Description:** Update complaint status, assign to admin, or resolve complaint. Only admin/staff can perform this action.

**Body:**
```json
{
  "status": "RESOLVED",
  "resolutionNote": "AC has been repaired by maintenance team. Issue resolved.",
  "assignedTo": "admin-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Complaint updated successfully",
  "data": {
    "id": "complaint-uuid",
    "title": "Hostel Room AC Not Working",
    "status": "RESOLVED",
    "resolvedAt": "2024-09-15T15:00:00Z",
    "resolutionNote": "AC has been repaired by maintenance team...",
    "student": {
      "id": "student-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "resolver": {
      "id": "admin-uuid",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "assignedAdmin": {
      "id": "admin-uuid",
      "name": "Admin User", 
      "email": "admin@example.com"
    },
    "updatedAt": "2024-09-15T15:00:00Z"
  }
}
```

#### Add Comment/Update to Complaint
```
POST /api/complaints/:id/updates
```
**Description:** Add comments or updates to a complaint. Students can comment on their own complaints, admin/staff can add internal or public comments.

**Body:**
```json
{
  "message": "Thank you for the quick resolution! The AC is working perfectly now.",
  "isInternal": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": "update-uuid",
    "updateType": "COMMENT",
    "message": "Thank you for the quick resolution!...",
    "isInternal": false,
    "createdAt": "2024-09-15T16:00:00Z",
    "updater": {
      "id": "student-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT"
    }
  }
}
```

#### Get Complaint Statistics (Admin)
```
GET /api/complaints/stats
```
**Description:** Get comprehensive complaint statistics and analytics. Only admins can access this endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Complaint statistics retrieved successfully", 
  "data": {
    "overview": {
      "total": 150,
      "open": 25,
      "resolved": 100,
      "inProgress": 20
    },
    "byCategory": [
      { "category": "HOSTEL", "_count": { "id": 45 } },
      { "category": "ACADEMIC", "_count": { "id": 30 } },
      { "category": "INFRASTRUCTURE", "_count": { "id": 25 } },
      { "category": "FOOD", "_count": { "id": 20 } },
      { "category": "OTHER", "_count": { "id": 30 } }
    ],
    "byPriority": [
      { "priority": "LOW", "_count": { "id": 60 } },
      { "priority": "MEDIUM", "_count": { "id": 70 } },
      { "priority": "HIGH", "_count": { "id": 15 } },
      { "priority": "CRITICAL", "_count": { "id": 5 } }
    ],
    "recentComplaints": [
      {
        "id": "complaint-uuid-1",
        "title": "Library WiFi Issues",
        "category": "TECHNICAL",
        "status": "OPEN",
        "priority": "MEDIUM",
        "createdAt": "2024-09-15T14:00:00Z",
        "student": {
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      }
    ]
  }
}
```

#### Delete Complaint (Admin)
```
DELETE /api/complaints/:id
```
**Description:** Soft delete a complaint by marking it as closed. Only admins can perform this action.

**Response:**
```json
{
  "success": true,
  "message": "Complaint deleted successfully"
}
```