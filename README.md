# 🌟 Kalam Foundation NGO Management System

A comprehensive full-stack web application for managing NGO operations, built with React frontend and Node.js backend, featuring MongoDB integration and role-based access control.

## 📁 Project Structure

```
kalam-foundation-project/
├── frontend/                 # React + Vite Frontend Application
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── services/       # API service layer
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
│
├── backend/                 # Node.js + Express Backend API
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models (Mongoose)
│   ├── routes/            # API route definitions
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration files
│   ├── scripts/           # Utility scripts (seed data, etc.)
│   ├── package.json       # Backend dependencies
│   └── server.js          # Main server file
│
└── docs/                   # Documentation
    ├── README.md           # Frontend documentation
    ├── BACKEND_README.md   # Backend API documentation
    └── DEPLOYMENT_GUIDE.md # Complete deployment guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd kalam-foundation-project
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health


## 🎯 Features

### 👥 User Management
- Role-based access control (Admin, Tutor)
- JWT authentication with secure tokens
- Center-based data access for tutors

### 🏠 Family Management
- Complete family profiles with contact information
- Address and demographic tracking
- Member relationship management

### 👨‍🎓 Student Tracking
- Student enrollment and progress monitoring
- Education level and demographic data
- Academic performance analytics

### 👩 Women Empowerment
- Skills training program tracking
- Employment status monitoring
- Income and job placement analytics

### 📅 Attendance Management
- Daily attendance marking
- Bulk attendance operations
- Attendance analytics and reporting

### 📊 Academic Performance
- Test score entry and tracking
- Subject-wise performance analytics
- Progress monitoring and reporting

### 📈 Analytics & Reports
- Comprehensive dashboard statistics
- Data export functionality (CSV)
- Real-time analytics and insights

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons 

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Security
- JWT authentication with 7-day expiration
- Password hashing with bcryptjs
- Rate limiting (100 requests/15min)
- Input validation with express-validator
- CORS protection with origin allowlist
- Security headers via Helmet.js

## 📊 Database Schema

### Core Entities
- **Users** - Authentication and role management
- **Families** - Family information and contacts
- **Students** - Student profiles and education data
- **Women** - Women empowerment program tracking
- **Attendance** - Daily attendance records
- **TestScores** - Academic performance data

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - Register new user (Admin only)

### Core Resources
- `/api/families` - Family management
- `/api/students` - Student management
- `/api/women` - Women empowerment tracking
- `/api/attendance` - Attendance management
- `/api/testscores` - Academic performance
- `/api/users` - User management (Admin only)
- `/api/admin` - Admin dashboard and analytics

## 🚀 Deployment

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```



## 📚 Documentation

- **[Frontend Documentation](docs/README.md)** - React app setup and components
- **[Backend API Documentation](docs/BACKEND_README.md)** - Complete API reference
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment instructions



**🎉 Built with ❤️ for empowering communities and transforming lives through the Kalam Foundation!**
