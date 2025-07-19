import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  register: (userData) => api.post('/auth/register', userData),
};

// Users API (Admin only)
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Families API
export const familiesAPI = {
  getFamilies: (params = {}) => {
    console.log('👨‍👩‍👧‍👦 Fetching families with params:', params);
    return api.get('/families', { params });
  },
  getFamilyById: (id) => {
    console.log('👨‍👩‍👧‍👦 Fetching family by ID:', id);
    return api.get(`/families/${id}`);
  },
  createFamily: (familyData) => {
    console.log('➕ Creating family with data:', familyData);

    // Validate required fields
    const requiredFields = ['name', 'contact', 'center', 'address'];
    const missingFields = requiredFields.filter(field => !familyData[field]);

    if (missingFields.length > 0) {
      const error = new Error(`Missing required fields: ${missingFields.join(', ')}`);
      console.error('❌ Validation Error:', error.message);
      return Promise.reject(error);
    }

    // Validate contact number
    if (!/^\d{10}$/.test(familyData.contact)) {
      const error = new Error('Contact must be a 10-digit number');
      console.error('❌ Validation Error:', error.message);
      return Promise.reject(error);
    }

    return api.post('/families', familyData);
  },
  updateFamily: (id, familyData) => {
    console.log('✏️ Updating family:', { id, data: familyData });
    return api.put(`/families/${id}`, familyData);
  },
  deleteFamily: (id) => {
    console.log('🗑️ Deleting family:', id);
    return api.delete(`/families/${id}`);
  }
};

// Students API
export const studentsAPI = {
  getStudents: (params) => api.get('/students', { params }),
  getStudentById: (id) => api.get(`/students/${id}`),
  getStudentProgress: (id) => api.get(`/students/${id}/progress`),
  createStudent: (studentData) => api.post('/students', studentData),
  updateStudent: (id, studentData) => api.put(`/students/${id}`, studentData),
  deleteStudent: (id) => api.delete(`/students/${id}`),
};

// Attendance API
export const attendanceAPI = {
  getAttendance: (params) => api.get('/attendance', { params }),
  getAttendanceSummary: (params) => api.get('/attendance/summary', { params }),
  markAttendance: (attendanceData) => api.post('/attendance', attendanceData),
  markBulkAttendance: (bulkData) => api.post('/attendance/bulk', bulkData),
};

// Test Scores API
export const testScoresAPI = {
  getTestScores: (params) => api.get('/testscores', { params }),
  getTestScoreAnalytics: (params) => api.get('/testscores/analytics', { params }),
  addTestScore: (scoreData) => api.post('/testscores', scoreData),
  addBulkTestScores: (bulkData) => api.post('/testscores/bulk', bulkData),
  updateTestScore: (id, scoreData) => api.put(`/testscores/${id}`, scoreData),
  deleteTestScore: (id) => api.delete(`/testscores/${id}`),
};

// Women API
export const womenAPI = {
  getWomen: (params) => api.get('/women', { params }),
  getWomanById: (id) => api.get(`/women/${id}`),
  getWomenStats: (params) => api.get('/women/stats', { params }),
  createWoman: (womanData) => api.post('/women', womanData),
  updateWoman: (id, womanData) => api.put(`/women/${id}`, womanData),
  deleteWoman: (id) => api.delete(`/women/${id}`),
};

// Admin API
export const adminAPI = {
  getStats: (params) => api.get('/admin/stats', { params }),
  exportData: (params) => {
    return api.get('/admin/export', { 
      params,
      responseType: 'blob' // For file download
    });
  },
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
  test: () => api.get('/test'),
};

export default api;
