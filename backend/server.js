const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { protect, requireRole } = require('./middleware/authMiddleware');
const { getBrandProfile, getCreatorProfile } = require('./controllers/authController');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Brand Collaboration Platform Backend API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Role-Based Profile Endpoints as per specification requirements:
// GET /api/brand/profile
app.get('/api/brand/profile', protect, requireRole('brand'), getBrandProfile);

// GET /api/creator/profile
app.get('/api/creator/profile', protect, requireRole('creator'), getCreatorProfile);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found - ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
