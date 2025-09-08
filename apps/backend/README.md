# ERP Backend API

A comprehensive Enterprise Resource Planning (ERP) system backend built with Node.js, Express, TypeScript, and Prisma ORM.

## 🚀 Overview

This backend API serves as the core infrastructure for an educational ERP system that manages universities, students, courses, hostels, applications, and administrative functions.

## 📋 Features

- **University Management**: CRUD operations for universities
- **User Management**: Students, professors, admins, and verifiers
- **Course Management**: Academic course administration
- **Hostel Management**: Accommodation management
- **Application System**: Student application processing with document upload
- **Notice System**: University announcements and notices
- **Semester Management**: Academic semester handling
- **Role-based Access Control**: Admin, verifier, student, and professor roles
- **Document Management**: File upload and verification system

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: express-validator
- **Authentication**: JWT (when implemented)
- **Password Hashing**: bcrypt

## 📁 Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── applicationController.ts
│   ├── courseController.ts
│   ├── hostelController.ts
│   ├── noticeController.ts
│   ├── semesterController.ts
│   ├── universityController.ts
│   └── userController.ts
├── middleware/          # Custom middleware functions
│   ├── authMiddleware.ts
│   ├── index.ts
│   └── requestValidatorMiddleware.ts
├── routes/              # API route definitions
│   ├── applicationRoutes.ts
│   ├── courseRoutes.ts
│   ├── hostelRoutes.ts
│   ├── index.ts
│   ├── noticeRoutes.ts
│   ├── semesterRoutes.ts
│   ├── universityRoutes.ts
│   └── userRoutes.ts
├── types/               # TypeScript type definitions
│   └── index.ts
└── index.ts            # Application entry point
```

## 🔧 Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   - Database URL should be configured in the `packages/db/.env` file
   - Default PostgreSQL connection: `postgresql://myuser:mysecretpassword@localhost:5400/ERP`

3. **Database Setup**:
   ```bash
   # Run from packages/db directory
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
The API uses header-based authentication for role verification:
- **Header**: `x-user-id`
- **Value**: User UUID from database

### Common Response Format
```json
{
  "success": boolean,
  "message": string,
  "data?": any,
  "error?": string
}
```

---

## 🎯 API Endpoints

### 🏢 Universities
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/universities` | Get all universities | No |
| GET | `/universities/:id` | Get university by ID | No |
| POST | `/universities` | Create university | Admin |
| POST | `/universities/onboard` | Onboard new university with admin | No |
| PUT | `/universities/:id` | Update university | Admin |
| DELETE | `/universities/:id` | Delete university | Admin |

**Create University Request**:
```json
{
  "name": "University Name",
  "uid": 12345
}
```

**Onboard University Request**:
```json
{
  "universityName": "University Name",
  "adminName": "Admin Name",
  "adminEmail": "admin@university.edu",
  "adminPassword": "securepassword"
}
```

---

### 👥 Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | Admin |
| GET | `/users/:id` | Get user by ID | Admin |
| POST | `/users` | Create user | Admin |
| PUT | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |

**Create User Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT", // USER, STUDENT, PROFESSOR, ADMIN, VERIFIER
  "universityId": "uuid"
}
```

---

### 📚 Courses
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/courses` | Get all courses | No |
| GET | `/courses/:id` | Get course by ID | No |
| POST | `/courses` | Create course | Admin |
| PUT | `/courses/:id` | Update course | Admin |
| DELETE | `/courses/:id` | Delete course | Admin |

**Create Course Request**:
```json
{
  "name": "Computer Science",
  "code": "CS101",
  "credits": 4,
  "totalSemester": 8,
  "totalFees": 50000.00,
  "universityId": "uuid"
}
```

---

### 🏠 Hostels
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/hostels` | Get all hostels | No |
| GET | `/hostels/:id` | Get hostel by ID | Staff |
| POST | `/hostels` | Create hostel | Staff |
| PUT | `/hostels/:id` | Update hostel | Staff |
| DELETE | `/hostels/:id` | Delete hostel | Staff |

**Create Hostel Request**:
```json
{
  "name": "Hostel A",
  "fees": 25000.00,
  "totalCapacity": 200,
  "type": "AC", // AC or NON_AC
  "universityId": "uuid"
}
```

---

### 📄 Applications
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/applications` | Get all applications | Admin/Verifier |
| GET | `/applications/:id` | Get application by ID | Admin/Verifier |
| POST | `/applications` | Create application | User |
| PUT | `/applications/:id` | Update application | User/Admin |
| DELETE | `/applications/:id` | Delete application | Admin |
| POST | `/applications/:id/verify` | Verify application | Verifier/Admin |
| POST | `/applications/:id/reject` | Reject application | Verifier/Admin |
| POST | `/applications/documents` | Add document to application | User |

**Create Application Request**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2000-01-01T00:00:00Z",
  "gender": "MALE", // MALE, FEMALE, OTHER
  "nationality": "Indian",
  "phoneNumber": "9876543210",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "class10Percentage": 95.5,
  "class10Board": "CBSE",
  "class10YearOfPassing": 2018,
  "class12Percentage": 92.0,
  "class12Board": "CBSE",
  "class12YearOfPassing": 2020,
  "class12Stream": "Science",
  "hasJeeMainsScore": true,
  "jeeMainsScore": 250,
  "jeeMainsRank": 1500,
  "jeeMainsYear": 2020,
  "preferredCourseId": "uuid",
  "userId": "uuid"
}
```

---

### 📢 Notices
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notices` | Get all notices | No |
| GET | `/notices/:id` | Get notice by ID | No |
| POST | `/notices` | Create notice | Admin |
| PUT | `/notices/:id` | Update notice | Admin |
| DELETE | `/notices/:id` | Delete notice | Admin |

**Create Notice Request**:
```json
{
  "title": "Important Announcement",
  "content": "This is the content of the notice...",
  "universityId": "uuid"
}
```

---

### 📅 Semesters
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/semesters` | Get all semesters | No |
| GET | `/semesters/:id` | Get semester by ID | No |
| POST | `/semesters` | Create semester | Admin |
| DELETE | `/semesters/:id` | Delete semester | Admin |

---

### 🔍 Health Check
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | API health status | No |

**Health Check Response**:
```json
{
  "success": true,
  "message": "ERP API is running",
  "timestamp": "2025-09-08T12:00:00.000Z"
}
```

---

## 🔐 Authentication & Authorization

### Role Hierarchy
1. **USER** - Basic user access
2. **STUDENT** - Student-specific features
3. **PROFESSOR** - Faculty access
4. **VERIFIER** - Can verify applications
5. **ADMIN** - Full system access

### Middleware Functions
- `requireAdmin` - Requires ADMIN role
- `requireVerifier` - Requires VERIFIER or ADMIN role
- `requireAuth` - Basic authentication check
- `requireStaff` - Requires staff-level access

---

## 📝 Application Workflow

### Student Application Process
1. **Submit Application** - Student fills out the application form
2. **Upload Documents** - Required documents (marksheets, certificates)
3. **Review Process** - Verifier reviews application and documents
4. **Verification** - Application is approved or rejected
5. **Status Updates** - Real-time status tracking

### Application Statuses
- `PENDING` - Just submitted, waiting for review
- `UNDER_REVIEW` - Being reviewed by verifier
- `VERIFIED` - Approved by verifier
- `REJECTED` - Rejected by verifier
- `INCOMPLETE` - Missing documents or information

### Document Types
- `CLASS_10_MARKSHEET`
- `CLASS_12_MARKSHEET`
- `JEE_MAINS_SCORECARD`
- `PHOTO`
- `SIGNATURE`
- `IDENTITY_PROOF`
- `ADDRESS_PROOF`
- `CATEGORY_CERTIFICATE`
- `INCOME_CERTIFICATE`

---

## 🔄 Error Handling

The API implements comprehensive error handling:

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 🧪 Testing

### Using the API
1. Start the server: `npm run dev`
2. Test health endpoint: `GET http://localhost:5000/api/v1/health`
3. Use tools like Postman, Insomnia, or curl for testing

### Example Request (Creating a University)
```bash
curl -X POST http://localhost:5000/api/v1/universities \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin-user-uuid" \
  -d '{
    "name": "Sample University",
    "uid": 12345
  }'
```

---

## 🚧 TODO & Future Enhancements

- [ ] Implement JWT-based authentication
- [ ] Add exam management system
- [ ] Create subject management
- [ ] Add file upload functionality with cloud storage
- [ ] Implement real-time notifications
- [ ] Add comprehensive logging
- [ ] Create API rate limiting
- [ ] Add comprehensive test coverage
- [ ] Implement caching layer
- [ ] Add API documentation with Swagger

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📞 Support

For any questions or issues, please create an issue in the repository or contact the development team.

---

**Version**: 1.0.0  
**License**: ISC  
**Last Updated**: September 2025
