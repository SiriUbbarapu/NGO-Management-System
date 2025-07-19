const express = require('express');
const {
  getDashboardStats,
  getStudentManagement,
  getAttendanceReports
} = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const { isAdminOrTutor, filterByUserAccess } = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(auth);
router.use(isAdminOrTutor);

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Tutor/Admin)
router.get('/stats', getDashboardStats);

// @route   GET /api/dashboard/students
// @desc    Get student management data
// @access  Private (Tutor/Admin)
router.get('/students', getStudentManagement);

// @route   GET /api/dashboard/attendance-reports
// @desc    Get attendance reports
// @access  Private (Tutor/Admin)
router.get('/attendance-reports', getAttendanceReports);

module.exports = router;
