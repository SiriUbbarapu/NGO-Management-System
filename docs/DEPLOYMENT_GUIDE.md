# 🚀 Kalam Foundation Dashboard - Complete Deployment Guide

## 📋 Project Overview

A comprehensive NGO management system with React frontend and Node.js backend, featuring JWT authentication, role-based access control, and MongoDB integration.

## 🏗️ Architecture

```
Frontend (React + Vite)     Backend (Node.js + Express)     Database (MongoDB)
├── Port: 5173             ├── Port: 5000                   ├── Local: 27017
├── Tailwind CSS           ├── JWT Authentication           ├── Atlas: Cloud
├── React Router           ├── Role-based Authorization     └── Collections:
├── Axios API calls        ├── Express Rate Limiting           ├── users
└── Neumorphic Design      ├── Input Validation                ├── families
                          ├── Security Headers                 ├── students
                          └── Error Handling                   ├── women
                                                              ├── attendance
                                                              └── testscores
```

## 🔧 Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd kalam-dashboard
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI
npm run test-server  # Test without MongoDB
npm run dev          # Full server with MongoDB
```

### 3. Frontend Setup
```bash
cd ../  # Back to root
npm install
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🔐 Demo Credentials

### Admin Access
- **Email**: `admin@kalamfoundation.org`
- **Password**: `admin123`
- **Permissions**: Full system access, user management, data export

### Tutor Access
- **Delhi Center**: `priya@kalamfoundation.org` / `tutor123`
- **Mumbai Center**: `rajesh@kalamfoundation.org` / `tutor123`
- **Bangalore Center**: `anita@kalamfoundation.org` / `tutor123`
- **Permissions**: Center-specific data access, attendance marking, score entry

## 🗄️ Database Setup

### Option 1: Local MongoDB
```bash
# Install MongoDB locally
mongod --dbpath /path/to/data

# Update .env
MONGO_URI=mongodb://localhost:27017/kalam-foundation
```

### Option 2: MongoDB Atlas (Recommended)
```bash
# Create cluster at https://cloud.mongodb.com
# Get connection string and update .env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/kalam-foundation
```

### Seed Demo Data
```bash
cd backend
npm run seed
```

## 🌐 Production Deployment

### Backend (Node.js)
```bash
# Environment variables
NODE_ENV=production
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-super-secure-production-secret
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com

# Deploy commands
npm install --production
npm start
```

### Frontend (React)
```bash
# Build for production
npm run build

# Deploy dist/ folder to:
# - Vercel, Netlify, or any static hosting
# - Update API base URL in src/services/api.js
```

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - Register user (Admin only)

### Core Entities
- **Families**: `/api/families` - CRUD operations
- **Students**: `/api/students` - Student management + progress tracking
- **Women**: `/api/women` - Women empowerment tracking
- **Attendance**: `/api/attendance` - Daily attendance marking
- **Test Scores**: `/api/testscores` - Academic performance tracking

### Admin Features
- `GET /api/admin/stats` - Comprehensive dashboard statistics
- `GET /api/admin/export` - Data export (CSV format)
- `GET /api/users` - User management (Admin only)

## 🔒 Security Features

- **JWT Authentication** with 7-day expiration
- **Password Hashing** using bcryptjs (12 salt rounds)
- **Rate Limiting** (100 requests/15min, 5 login attempts/15min)
- **Input Validation** using express-validator
- **CORS Protection** with origin allowlist
- **Security Headers** via Helmet.js
- **Role-based Authorization** (Admin vs Tutor permissions)

## 🎨 Frontend Features

- **Neumorphic Design** with soft shadows and rounded corners
- **Responsive Layout** works on desktop, tablet, and mobile
- **Real-time Updates** with optimistic UI updates
- **Form Validation** with user-friendly error messages
- **Loading States** and error handling throughout
- **Accessibility** features with proper ARIA labels

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test-server  # Test server without MongoDB
curl http://localhost:5000/api/health
curl http://localhost:5000/api/test
```

### Frontend Testing
```bash
npm run dev
# Open http://localhost:5173
# Test login with demo credentials
# Navigate through all pages
```

## 📈 Performance Optimization

### Backend
- Database indexing on frequently queried fields
- Pagination for large datasets
- Efficient aggregation pipelines
- Connection pooling with Mongoose

### Frontend
- Code splitting with React Router
- Lazy loading of components
- Optimized bundle size with Vite
- Image optimization and caching

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB is running
   mongod --version
   # Verify connection string in .env
   ```

2. **CORS Errors**
   ```bash
   # Update FRONTEND_URL in backend .env
   FRONTEND_URL=http://localhost:5173
   ```

3. **Tailwind Styles Not Loading**
   ```bash
   # Restart frontend dev server
   npm run dev
   ```

4. **API Calls Failing**
   ```bash
   # Check backend is running on port 5000
   curl http://localhost:5000/api/health
   ```

## 📞 Support

For technical support:
1. Check the logs in browser console and terminal
2. Verify all environment variables are set correctly
3. Ensure both frontend and backend servers are running
4. Test API endpoints individually using curl or Postman

## 🎯 Next Steps

1. **Database Setup**: Configure MongoDB Atlas or local MongoDB
2. **Environment Configuration**: Update all .env variables
3. **Demo Data**: Run seed script for testing
4. **User Training**: Familiarize users with the interface
5. **Production Deployment**: Deploy to cloud platforms
6. **Monitoring**: Set up logging and error tracking
7. **Backup Strategy**: Implement regular database backups

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🎉 Congratulations! Your Kalam Foundation Dashboard is ready to empower communities and transform lives!**
