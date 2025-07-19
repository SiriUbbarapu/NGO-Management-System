const express = require('express');
const {
  getStudents,
  getStudentById,
  getStudentProgress,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const auth = require('../middleware/auth');
const { isAdminOrTutor, filterByUserAccess } = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(auth);
router.use(isAdminOrTutor);

// @route   GET /api/students
router.get('/', filterByUserAccess, getStudents);

// @route   GET /api/students/:id
router.get('/:id', getStudentById);

// @route   GET /api/students/:id/progress
router.get('/:id/progress', getStudentProgress);

// @route   POST /api/students
router.post('/', createStudent);

// @route   PUT /api/students/:id
router.put('/:id', updateStudent);

// @route   DELETE /api/students/:id
router.delete('/:id', deleteStudent);

module.exports = router;
