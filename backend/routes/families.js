const express = require('express');
const {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily
} = require('../controllers/familyController');
const auth = require('../middleware/auth');
const { isAdminOrTutor, filterByUserAccess } = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(auth);
router.use(isAdminOrTutor);

// @route   GET /api/families
router.get('/', filterByUserAccess, getFamilies);

// @route   GET /api/families/:id
router.get('/:id', getFamilyById);

// @route   POST /api/families
router.post('/', createFamily);

// @route   PUT /api/families/:id
router.put('/:id', updateFamily);

// @route   DELETE /api/families/:id
router.delete('/:id', deleteFamily);

module.exports = router;
