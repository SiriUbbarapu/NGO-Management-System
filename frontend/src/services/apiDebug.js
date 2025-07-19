import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and log requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🚀 API Request:', {
      method: config.method.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
      token: token ? 'Present' : 'Missing'
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No authentication token found!');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and log responses
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    
    // Return the data directly (this is what your code expects)
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        data: error.config?.data
      }
    });
    
    if (error.response?.status === 401) {
      console.warn('🔒 Authentication failed - redirecting to login');
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
  login: (credentials) => {
    console.log('🔐 Attempting login with:', { email: credentials.email });
    return api.post('/auth/login', credentials);
  },
  getMe: () => {
    console.log('👤 Fetching current user');
    return api.get('/auth/me');
  },
  register: (userData) => {
    console.log('📝 Registering user:', { email: userData.email, role: userData.role });
    return api.post('/auth/register', userData);
  },
};

// Families API with detailed logging
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
  getStudents: (params = {}) => api.get('/students', { params }),
  getStudentById: (id) => api.get(`/students/${id}`),
  createStudent: (studentData) => api.post('/students', studentData),
  updateStudent: (id, studentData) => api.put(`/students/${id}`, studentData),
  deleteStudent: (id) => api.delete(`/students/${id}`)
};

// Women API
export const womenAPI = {
  getWomen: (params = {}) => api.get('/women', { params }),
  getWomanById: (id) => api.get(`/women/${id}`),
  createWoman: (womanData) => api.post('/women', womanData),
  updateWoman: (id, womanData) => api.put(`/women/${id}`, womanData),
  deleteWoman: (id) => api.delete(`/women/${id}`)
};

// Attendance API
export const attendanceAPI = {
  getAttendance: (params = {}) => api.get('/attendance', { params }),
  markAttendance: (attendanceData) => api.post('/attendance', attendanceData),
  updateAttendance: (id, attendanceData) => api.put(`/attendance/${id}`, attendanceData),
  deleteAttendance: (id) => api.delete(`/attendance/${id}`)
};

// Test Scores API
export const testScoresAPI = {
  getTestScores: (params = {}) => api.get('/testscores', { params }),
  createTestScore: (scoreData) => api.post('/testscores', scoreData),
  updateTestScore: (id, scoreData) => api.put(`/testscores/${id}`, scoreData),
  deleteTestScore: (id) => api.delete(`/testscores/${id}`)
};

// Users API (Admin only)
export const usersAPI = {
  getUsers: (params = {}) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`)
};

// Admin API
export const adminAPI = {
  getStats: () => {
    console.log('📊 Fetching admin statistics');
    return api.get('/admin/stats');
  },
  exportData: (type) => {
    console.log('📤 Exporting data:', type);
    return api.get(`/admin/export/${type}`, { responseType: 'blob' });
  }
};

// Utility function to test API connection
export const testConnection = async () => {
  try {
    console.log('🔍 Testing API connection...');
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('✅ API Health Check:', data);
    return data;
  } catch (error) {
    console.error('❌ API Connection Failed:', error);
    throw error;
  }
};

// Utility function to check authentication status
export const checkAuthStatus = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('🔍 Authentication Status:', {
    token: token ? 'Present' : 'Missing',
    tokenLength: token ? token.length : 0,
    user: user ? JSON.parse(user) : null,
    isLoggedIn: !!(token && user)
  });
  
  return {
    token,
    user: user ? JSON.parse(user) : null,
    isLoggedIn: !!(token && user)
  };
};

export default api;
