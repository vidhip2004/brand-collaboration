const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Helper to generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'brandcollab_secret_key_2026_jwt_token_secure',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new Brand user
// @route   POST /api/auth/register/brand
// @access  Public
const registerBrand = async (req, res) => {
  // Check express-validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({ param: err.path, msg: err.msg })),
      message: errors.array()[0].msg,
    });
  }

  const {
    name,
    companyName,
    contactPerson,
    email,
    password,
    instagramHandle,
    instagramUsername,
    industry,
    country,
  } = req.body;

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      });
    }

    // Determine final name
    const finalName = companyName || name || contactPerson || 'Brand User';
    const finalInstagram = instagramHandle || instagramUsername || '';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create brand user
    const user = await User.create({
      name: finalName,
      companyName: companyName || finalName,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'brand',
      instagramHandle: finalInstagram,
      industry: industry || '',
      country: country || '',
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Brand registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        companyName: user.companyName,
        email: user.email,
        role: user.role,
        instagramHandle: user.instagramHandle,
        industry: user.industry,
        country: user.country,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in registerBrand:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during brand registration',
      error: error.message,
    });
  }
};

// @desc    Register a new Creator user
// @route   POST /api/auth/register/creator
// @access  Public
const registerCreator = async (req, res) => {
  // Check express-validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({ param: err.path, msg: err.msg })),
      message: errors.array()[0].msg,
    });
  }

  const {
    name,
    username,
    email,
    password,
    instagramHandle,
    instagramUsername,
    niche,
    primaryNiche,
    country,
  } = req.body;

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      });
    }

    const finalName = name || username || 'Creator User';
    const finalInstagram = instagramHandle || instagramUsername || '';
    const finalNiche = niche || primaryNiche || '';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create creator user
    const user = await User.create({
      name: finalName,
      username: username || '',
      email: normalizedEmail,
      password: hashedPassword,
      role: 'creator',
      instagramHandle: finalInstagram,
      niche: finalNiche,
      country: country || '',
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Creator registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        instagramHandle: user.instagramHandle,
        niche: user.niche,
        country: user.country,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in registerCreator:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during creator registration',
      error: error.message,
    });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({ param: err.path, msg: err.msg })),
      message: errors.array()[0].msg,
    });
  }

  const { email, password } = req.body;

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT Token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        username: user.username,
        instagramHandle: user.instagramHandle,
        industry: user.industry,
        niche: user.niche,
        country: user.country,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user profile',
    });
  }
};

// @desc    Get protected Brand profile test endpoint
// @route   GET /api/brand/profile
// @access  Private (Brand only)
const getBrandProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome to the Brand Portal! Protected brand route accessed successfully.',
    user: req.user,
  });
};

// @desc    Get protected Creator profile test endpoint
// @route   GET /api/creator/profile
// @access  Private (Creator only)
const getCreatorProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome to the Creator Hub! Protected creator route accessed successfully.',
    user: req.user,
  });
};

module.exports = {
  registerBrand,
  registerCreator,
  loginUser,
  getMe,
  getBrandProfile,
  getCreatorProfile,
};
