const express = require('express');
const {
  getAdminStats,
  exportData
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');

const router = express.Router();

// All routes require authentication and admin privileges
router.use(auth);
router.use(isAdmin);

// @route   GET /api/admin/stats
router.get('/stats', getAdminStats);

// @route   GET /api/admin/export
router.get('/export', exportData);

module.exports = router;
