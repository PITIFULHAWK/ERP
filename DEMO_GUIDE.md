# ERP System Demo Guide

## 🚀 Quick Start

### Demo URLs

- **Admin Frontend**: http://localhost:3001
- **User Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/v1

### Demo Credentials

#### Admin Login

- **Email**: admin@soa.ac.in
- **Password**: admin123
- **Role**: ADMIN
- **Access**: Full system administration

#### Student Login

- **Email**: student@soa.ac.in
- **Password**: student123
- **Role**: USER
- **Access**: Student application and dashboard

## 📊 Demo Data Overview

### System Statistics

- **Universities**: 1 (SOA University)
- **Users**: 52 total
    - 1 Admin
    - 1 Demo Student
    - 50 Seeded Users (Students & Professors)
- **Courses**: 5 (CSE, ME, EE, CE, ECE)
- **Hostels**: 4 (AC and Non-AC options)
- **Applications**: 10 sample applications
- **Notices**: 3 university notices

## 🎯 Demo Features

### Admin Frontend (http://localhost:3001)

1. **Dashboard**
    - Application statistics and overview
    - Recent applications tracking
    - Quick action buttons

2. **Applications Management**
    - View all student applications
    - Filter by status (Pending, Under Review, Verified, Rejected)
    - Bulk actions for application processing
    - Individual application review and verification

3. **Users Management**
    - Complete user directory
    - Role-based user management
    - User profile editing and status updates

4. **Universities Management**
    - University information and settings
    - Administrative controls

5. **Courses Management**
    - Course catalog administration
    - Course details and enrollment tracking

6. **Hostels Management**
    - Hostel information and capacity management
    - Fee structure and amenities

7. **Analytics**
    - System usage statistics
    - Application trends and reports

8. **Notices**
    - University announcements
    - Notice creation and management

### User Frontend (http://localhost:3000)

1. **Landing Page**
    - University information
    - Admission process overview
    - Statistics display

2. **Student Dashboard**
    - Application status tracking
    - Quick actions for application process
    - Important links and resources

3. **Application System**
    - Multi-step application wizard:
        - Personal Information
        - Address Information
        - Academic Records
        - Course Preference
        - Document Upload
        - Review & Submit

4. **Application Status Tracking**
    - Real-time status updates
    - Application timeline
    - Document verification status

5. **Profile Management**
    - Personal information editing
    - Security settings
    - Notification preferences

6. **Courses Browser**
    - Comprehensive course catalog with search and filtering
    - Sort by name, fees, popularity, or duration
    - Filter by university with real-time statistics
    - Course details including fees, duration, and enrollment

7. **Notices**
    - University announcements with search and filtering
    - Filter by type (General, Academic, Exam, Hostel, Urgent)
    - Filter by priority (High, Medium, Low)
    - Real-time date formatting and responsive design

8. **Payments**
    - Payment history
    - Fee structure information

## 🔧 Technical Features

### Backend API

- **Authentication**: JWT-based with role-based access control
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Express-validator for request validation
- **Error Handling**: Comprehensive error responses
- **CORS**: Configured for both frontend applications

### Frontend Technologies

- **Framework**: Next.js 15.5.2 with React 19.1.0
- **Styling**: Tailwind CSS with Shadcn/ui components
- **State Management**: React Context API
- **Authentication**: JWT token management
- **API Client**: Centralized API client with error handling

### Key Integrations

- **File Upload**: Document management system
- **Email Queue**: Redis-based email notifications
- **Real-time Updates**: Application status tracking
- **Responsive Design**: Mobile-friendly interface

## 🎪 Demo Scenarios

### Scenario 1: Admin Workflow

1. Login as admin (admin@soa.ac.in / admin123)
2. Review dashboard statistics
3. Navigate to Applications section
4. Review pending applications
5. Verify or reject applications
6. Check user management features
7. Create new notices

### Scenario 2: Student Workflow

1. Visit user frontend (http://localhost:3000)
2. Register new account or login as demo student
3. Complete application process step-by-step
4. Upload required documents
5. Track application status
6. Browse available courses
7. Check notices and updates

### Scenario 3: End-to-End Process

1. Student submits application
2. Admin reviews and processes application
3. Status updates reflect in real-time
4. Document verification workflow
5. Final approval/rejection process

## 🚨 Important Notes

### For Judges/Evaluators

- All features are fully functional with real database
- Demo data is realistic and comprehensive
- Both frontends are responsive and polished
- Backend API is robust with proper error handling
- Authentication and authorization are properly implemented

### System Requirements

- Node.js and pnpm for package management
- PostgreSQL database (running on port 5433)
- Redis for email queue services
- All services are currently running and ready for demo

### Troubleshooting

- If login fails, ensure backend is running on port 5000
- If data doesn't load, check database connection
- All demo credentials are case-sensitive
- Refresh browser if authentication issues occur

## 🏆 Hackathon Highlights

1. **Complete ERP Solution**: Full-featured university management system
2. **Modern Tech Stack**: Latest versions of React, Next.js, and Node.js
3. **Professional UI/UX**: Polished interface with consistent design
4. **Scalable Architecture**: Monorepo structure with proper separation
5. **Real-world Features**: Document upload, role-based access, notifications
6. **Demo Ready**: Comprehensive test data and working credentials

---

**Ready for Demo!** 🎉

All systems are operational and loaded with realistic demo data. The application showcases a complete university ERP system with both administrative and student-facing interfaces.
