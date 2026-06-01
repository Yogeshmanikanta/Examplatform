import express from 'express';
import {
  register,
  login,
  verifyOTP,
  forgotPassword,
  resetPassword,
  getMe
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no token needed)
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (token required)
router.get('/me', protect, getMe);

export default router;