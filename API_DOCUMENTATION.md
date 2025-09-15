# ERP System API Documentation

## Overview
This document provides comprehensive documentation for all API endpoints in the ERP system, including academic management, user management, applications, payments, and administrative features.

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

### Resource Sharing

#### Share Resource (Professor)
```
POST /api/resources/share
```
**Body:** (multipart/form-data)
```
professorId: "professor-uuid"
sectionId: "section-uuid"
subjectId: "subject-uuid"
title: "Resource Title"
description: "Resource Description"
resourceType: "NOTES"
file: <uploaded file>
```

#### Get Resources for Professor
```
GET /api/resources/professor/:professorId
```
**Query Parameters:**
- `sectionId` (optional)
- `subjectId` (optional)

#### Get Resource Statistics
```
GET /api/resources/professor/:professorId/stats
```

#### Get Resources for Student
```
GET /api/resources/student/:studentId
```
**Query Parameters:**
- `subjectId` (optional)
- `sectionId` (optional)

#### Update Resource
```
PUT /api/resources/:resourceId
```
**Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated Description",
  "isVisible": true
}
```

#### Delete Resource
```
DELETE /api/resources/:resourceId
```

#### Track Resource Download
```
POST /api/resources/:resourceId/download
```
**Body:**
```json
{
  "studentId": "student-uuid"
}
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

#### Get Placement by ID
```
GET /api/placements/:id
```

#### Create Placement (Admin)
```
POST /api/placements
```

#### Update Placement (Admin)
```
PUT /api/placements/:id
```

#### Delete Placement (Admin)
```
DELETE /api/placements/:id
```

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

The resource management system enables professors to share educational materials with their sections and allows students to access and download these resources.

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
  "isDownloadable": true,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resource shared successfully",
  "data": {
    "id": "resource-uuid",
    "title": "Week 1 Lecture Notes",
    "resourceType": "NOTES",
    "fileUrl": "https://example.com/week1-notes.pdf",
    "fileName": "DBMS_Week1_Notes.pdf",
    "sharedAt": "2024-09-15T10:00:00Z",
    "professor": {
      "name": "Dr. Smith",
      "email": "smith@university.edu"
    },
    "section": {
      "name": "Section A",
      "code": "A"
    }
  }
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

**Response:**
```json
{
  "success": true,
  "message": "Student resources retrieved successfully",
  "data": [
    {
      "id": "resource-uuid",
      "title": "Week 1 Lecture Notes",
      "description": "Introduction to Database Management Systems",
      "resourceType": "NOTES",
      "fileName": "DBMS_Week1_Notes.pdf",
      "fileSize": 2048576,
      "isDownloadable": true,
      "downloadCount": 25,
      "sharedAt": "2024-09-15T10:00:00Z",
      "expiresAt": "2024-12-31T23:59:59Z",
      "professor": {
        "name": "Dr. Smith",
        "email": "smith@university.edu"
      },
      "subject": {
        "name": "Database Management Systems",
        "code": "DBMS101"
      }
    }
  ]
}
```

#### Get Resources for Professor
```
GET /api/resources/professor/:professorId
```
**Description:** Professors can view resources they have shared.

#### Update Resource (Professor)
```
PUT /api/resources/:resourceId
```
**Description:** Update resource details like title, description, or expiry date.

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

**Response:**
```json
{
  "success": true,
  "message": "Resource statistics retrieved successfully",
  "data": {
    "totalResources": 15,
    "totalDownloads": 450,
    "mostDownloaded": {
      "title": "Final Exam Study Guide",
      "downloads": 75
    },
    "recentActivity": [
      {
        "resourceTitle": "Week 1 Lecture Notes",
        "downloads": 25,
        "lastDownload": "2024-09-15T14:30:00Z"
      }
    ]
  }
}
```

**Resource Types:**
- `NOTES` - Lecture notes and study materials
- `ASSIGNMENT` - Assignment documents and instructions
- `REFERENCE` - Reference materials and additional reading
- `VIDEO` - Video lectures and tutorials
- `PRESENTATION` - Slide presentations
- `DATASET` - Data files for projects and assignments
- `SOFTWARE` - Software tools and applications
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