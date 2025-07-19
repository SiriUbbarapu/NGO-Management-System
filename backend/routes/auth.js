const express = require('express');
const { login, getMe, register } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/role');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateLogin, validateUserCreation } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/auth/login
router.post('/login', authLimiter, validateLogin, login);

// @route   GET /api/auth/me
router.get('/me', auth, getMe);

// @route   POST /api/auth/register (Admin only)
router.post('/register', auth, isAdmin, validateUserCreation, register);

module.exports = router;
