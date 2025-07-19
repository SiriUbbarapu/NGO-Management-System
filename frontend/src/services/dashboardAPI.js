import api from './api';

const dashboardAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response; // api.js already returns response.data
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  // Get student management data
  getStudentManagement: async () => {
    try {
      const response = await api.get('/dashboard/students');
      return response; // api.js already returns response.data
    } catch (error) {
      console.error('Get student management error:', error);
      throw error;
    }
  },

  // Get attendance reports
  getAttendanceReports: async (params = {}) => {
    try {
      const response = await api.get('/dashboard/attendance-reports', { params });
      return response; // api.js already returns response.data
    } catch (error) {
      console.error('Get attendance reports error:', error);
      throw error;
    }
  }
};

export default dashboardAPI;
