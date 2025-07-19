const express = require('express');
const {
  getAttendance,
  markAttendance,
  markBulkAttendance,
  getAttendanceSummary
} = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const { isAdminOrTutor } = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(auth);
router.use(isAdminOrTutor);

// @route   GET /api/attendance
router.get('/', getAttendance);

// @route   GET /api/attendance/summary
router.get('/summary', getAttendanceSummary);

// @route   POST /api/attendance
router.post('/', markAttendance);

// @route   POST /api/attendance/bulk
router.post('/bulk', markBulkAttendance);

module.exports = router;
