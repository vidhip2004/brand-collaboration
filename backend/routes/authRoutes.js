const express = require('express');
const { body } = require('express-validator');
const {
  registerBrand,
  registerCreator,
  loginUser,
  getMe,
  getBrandProfile,
  getCreatorProfile,
} = require('../controllers/authController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation Rules for Brand Registration
const brandValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// Validation Rules for Creator Registration
const creatorValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// Validation Rules for Login
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public Routes
router.post('/register/brand', brandValidation, registerBrand);
router.post('/register/creator', creatorValidation, registerCreator);
router.post('/login', loginValidation, loginUser);

// Protected Routes
router.get('/me', protect, getMe);

// Protected Role-Specific Test Endpoints
router.get('/brand/profile', protect, requireRole('brand'), getBrandProfile);
router.get('/creator/profile', protect, requireRole('creator'), getCreatorProfile);

module.exports = router;
