// backend/routes/authRoutes.js
import express from 'express';
console.log('--- authRoutes.js file is being loaded ---'); 

import {
  registerUser,
  authUser,
  getUserProfile,
} from '../controllers/authController.js'; // Ensure this path is correct
import { protect } from '../middleware/authMiddleware.js'; // We will create this middleware next

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (for initial admin setup, then protect or remove)
// @access  Public (for now)
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authUser);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private (requires token)
router.get('/profile', protect, getUserProfile); // 'protect' middleware will run before getUserProfile

export default router;