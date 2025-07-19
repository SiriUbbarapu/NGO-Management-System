const express = require('express');
const {
  getTestScores,
  addTestScore,
  addBulkTestScores,
  updateTestScore,
  deleteTestScore,
  getTestScoreAnalytics
} = require('../controllers/testScoreController');
const auth = require('../middleware/auth');
const { isAdminOrTutor } = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(auth);
router.use(isAdminOrTutor);

// @route   GET /api/testscores
router.get('/', getTestScores);

// @route   GET /api/testscores/analytics
router.get('/analytics', getTestScoreAnalytics);

// @route   POST /api/testscores
router.post('/', addTestScore);

// @route   POST /api/testscores/bulk
router.post('/bulk', addBulkTestScores);

// @route   PUT /api/testscores/:id
router.put('/:id', updateTestScore);

// @route   DELETE /api/testscores/:id
router.delete('/:id', deleteTestScore);

module.exports = router;
