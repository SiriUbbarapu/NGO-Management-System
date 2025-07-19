const { body, validationResult } = require('express-validator');

// Validation middleware to check for errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// User creation validation
const validateUserCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['admin', 'tutor'])
    .withMessage('Role must be either admin or tutor'),
  body('center')
    .if(body('role').equals('tutor'))
    .notEmpty()
    .withMessage('Center is required for tutor role'),
  handleValidationErrors
];

// Family creation validation
const validateFamilyCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Family name must be between 2 and 100 characters'),
  body('contact')
    .matches(/^[0-9]{10}$/)
    .withMessage('Contact must be a valid 10-digit number'),
  body('center')
    .trim()
    .notEmpty()
    .withMessage('Center is required'),
  body('address')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  handleValidationErrors
];

// Student creation validation
const validateStudentCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Student name must be between 2 and 100 characters'),
  body('familyId')
    .isMongoId()
    .withMessage('Valid family ID is required'),
  body('center')
    .trim()
    .notEmpty()
    .withMessage('Center is required'),
  body('educationLevel')
    .isIn(['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
           'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'])
    .withMessage('Invalid education level'),
  body('age')
    .isInt({ min: 3, max: 25 })
    .withMessage('Age must be between 3 and 25'),
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  handleValidationErrors
];

// Woman creation validation
const validateWomanCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('familyId')
    .isMongoId()
    .withMessage('Valid family ID is required'),
  body('age')
    .isInt({ min: 18, max: 65 })
    .withMessage('Age must be between 18 and 65'),
  body('skill')
    .isIn(['Tailoring', 'Cooking', 'Handicrafts', 'Computer Skills', 'Beauty & Wellness', 
           'Embroidery', 'Knitting', 'Jewelry Making', 'Painting', 'Other'])
    .withMessage('Invalid skill'),
  body('trainingStatus')
    .isIn(['Not Started', 'Started', 'In Progress', 'Completed', 'Discontinued'])
    .withMessage('Invalid training status'),
  body('jobStatus')
    .isIn(['Unemployed', 'Self Employed', 'Employed', 'Seeking Employment'])
    .withMessage('Invalid job status'),
  body('center')
    .trim()
    .notEmpty()
    .withMessage('Center is required'),
  body('contactNumber')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Contact number must be a valid 10-digit number'),
  handleValidationErrors
];

// Attendance validation
const validateAttendance = [
  body('studentId')
    .isMongoId()
    .withMessage('Valid student ID is required'),
  body('status')
    .isIn(['Present', 'Absent'])
    .withMessage('Status must be Present or Absent'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in valid ISO format'),
  body('notes')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters'),
  handleValidationErrors
];

// Test score validation
const validateTestScore = [
  body('studentId')
    .isMongoId()
    .withMessage('Valid student ID is required'),
  body('subject')
    .isIn(['Mathematics', 'English', 'Science', 'Social Studies', 'Hindi', 'Computer', 'Art', 'Physical Education'])
    .withMessage('Invalid subject'),
  body('score')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
  body('maxScore')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Maximum score must be at least 1'),
  body('testType')
    .isIn(['Quiz', 'Unit Test', 'Mid Term', 'Final Exam', 'Assignment', 'Project'])
    .withMessage('Invalid test type'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in valid ISO format'),
  body('remarks')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Remarks cannot exceed 300 characters'),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateUserCreation,
  validateFamilyCreation,
  validateStudentCreation,
  validateWomanCreation,
  validateAttendance,
  validateTestScore,
  handleValidationErrors
};
