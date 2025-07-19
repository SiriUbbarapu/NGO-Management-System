const express = require('express');
const {
  getWomen,
  getWomanById,
  createWoman,
  updateWoman,
  deleteWoman,
  getWomenStats
} = require('../controllers/womenController');
const auth = require('../middleware/auth');
const { isAdminOrTutor, filterByUserAccess } = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(auth);
router.use(isAdminOrTutor);

// @route   GET /api/women
router.get('/', filterByUserAccess, getWomen);

// @route   GET /api/women/stats
router.get('/stats', filterByUserAccess, getWomenStats);

// @route   GET /api/women/:id
router.get('/:id', getWomanById);

// @route   POST /api/women
router.post('/', createWoman);

// @route   PUT /api/women/:id
router.put('/:id', updateWoman);

// @route   DELETE /api/women/:id
router.delete('/:id', deleteWoman);

module.exports = router;
