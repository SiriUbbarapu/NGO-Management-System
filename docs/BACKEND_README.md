# Kalam Foundation Backend API

A comprehensive Node.js backend for the Kalam Foundation NGO dashboard system with JWT authentication, role-based access control, and MongoDB integration.

## 🚀 Features

- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Admin and Tutor roles with different permissions
- **MongoDB Integration** - Full CRUD operations with Mongoose ODM
- **RESTful APIs** - Complete API endpoints for all entities
- **Data Export** - CSV export functionality for admin users
- **Security Middleware** - Helmet, CORS, rate limiting, and input validation
- **Comprehensive Logging** - Request logging and error handling
- **Seed Data** - Pre-populated demo data for testing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kalam-dashboard/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGO_URI=mongodb://localhost:27017/kalam-foundation
   JWT_SECRET=your-super-secure-jwt-secret
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB** (if using local installation)
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   
   # Test server (without MongoDB dependency)
   npm run test-server
   ```

6. **Seed demo data** (optional)
   ```bash
   npm run seed
   ```

## 🔐 Authentication

### Login Credentials (after seeding)

**Admin User:**
- Email: `admin@kalamfoundation.org`
- Password: `admin123`

**Tutor Users:**
- Delhi Center: `priya@kalamfoundation.org` / `tutor123`
- Mumbai Center: `rajesh@kalamfoundation.org` / `tutor123`
- Bangalore Center: `anita@kalamfoundation.org` / `tutor123`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Headers
```
Authorization: Bearer <jwt-token>
```

### Endpoints

#### 🔐 Authentication
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/register` - Register new user (Admin only)

#### 👥 Users (Admin Only)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### 🏠 Families
- `GET /families` - Get all families
- `GET /families/:id` - Get family with members
- `POST /families` - Create new family
- `PUT /families/:id` - Update family
- `DELETE /families/:id` - Delete family

#### 👨‍🎓 Students
- `GET /students` - Get all students
- `GET /students/:id` - Get student by ID
- `GET /students/:id/progress` - Get student progress
- `POST /students` - Create new student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

#### 📅 Attendance
- `GET /attendance` - Get attendance records
- `GET /attendance/summary` - Get attendance summary
- `POST /attendance` - Mark attendance
- `POST /attendance/bulk` - Mark bulk attendance

#### 📊 Test Scores
- `GET /testscores` - Get test scores
- `GET /testscores/analytics` - Get test score analytics
- `POST /testscores` - Add test score
- `POST /testscores/bulk` - Add bulk test scores
- `PUT /testscores/:id` - Update test score
- `DELETE /testscores/:id` - Delete test score

#### 👩 Women
- `GET /women` - Get all women
- `GET /women/:id` - Get woman by ID
- `GET /women/stats` - Get women statistics
- `POST /women` - Create new woman
- `PUT /women/:id` - Update woman
- `DELETE /women/:id` - Delete woman

#### 📈 Admin Dashboard (Admin Only)
- `GET /admin/stats` - Get comprehensive statistics
- `GET /admin/export` - Export data to CSV

### Query Parameters

Most GET endpoints support pagination and filtering:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term
- `center` - Filter by center
- `startDate` - Start date filter
- `endDate` - End date filter

Example:
```
GET /api/students?page=1&limit=20&center=Delhi%20Center&search=john
```

## 🏗️ Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "admin" | "tutor",
  center: String (required for tutors),
  isActive: Boolean
}
```

### Family
```javascript
{
  name: String,
  contact: String,
  center: String,
  address: String,
  totalMembers: Number,
  isActive: Boolean,
  createdBy: ObjectId (User)
}
```

### Student
```javascript
{
  name: String,
  familyId: ObjectId (Family),
  center: String,
  educationLevel: String,
  age: Number,
  gender: String,
  enrollmentDate: Date,
  isActive: Boolean,
  createdBy: ObjectId (User)
}
```

### Woman
```javascript
{
  name: String,
  familyId: ObjectId (Family),
  age: Number,
  skill: String,
  trainingStatus: String,
  trainingStartDate: Date,
  trainingEndDate: Date,
  jobStatus: String,
  monthlyIncome: Number,
  center: String,
  contactNumber: String,
  isActive: Boolean,
  createdBy: ObjectId (User)
}
```

### Attendance
```javascript
{
  studentId: ObjectId (Student),
  date: Date,
  status: "Present" | "Absent",
  markedBy: ObjectId (User),
  center: String,
  notes: String
}
```

### TestScore
```javascript
{
  studentId: ObjectId (Student),
  subject: String,
  score: Number,
  maxScore: Number,
  testType: String,
  date: Date,
  markedBy: ObjectId (User),
  center: String,
  remarks: String
}
```

## 🔒 Security Features

- **JWT Authentication** with 7-day expiration
- **Password Hashing** using bcryptjs
- **Rate Limiting** (100 requests/15min general, 5 login attempts/15min)
- **Input Validation** using express-validator
- **CORS Protection** with specific origin allowlist
- **Helmet Security Headers**
- **Request Logging**
- **Error Handling** with sanitized error messages

## 🎯 Role-Based Permissions

### Admin
- Full access to all data across all centers
- User management (create, update, delete users)
- Data export functionality
- System statistics and analytics

### Tutor
- Access only to their assigned center's data
- Can create and manage families, students, and women
- Can mark attendance and add test scores
- Cannot access user management or system-wide statistics

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/kalam-foundation
JWT_SECRET=your-production-jwt-secret
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
```


## 🧪 Testing

```bash
# Test server connectivity
npm run test-server

# Test API endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/test
```

