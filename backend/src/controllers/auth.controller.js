import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';
import { UserModel } from '../models/user.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOTPEmail = async (email, subject, otp) => {
  const senderEmail = process.env.SENDGRID_SENDER_EMAIL || process.env.EMAIL_FROM;
  if (!process.env.SENDGRID_API_KEY || !senderEmail) {
    throw new Error('SendGrid API key or sender email is not configured');
  }

  const msg = {
    to: email,
    from: senderEmail,
    subject,
    html: `
      <p>Hello,</p>
      <p>Your ExamPlatform verification code is:</p>
      <h2 style="letter-spacing: 0.2em;">${otp}</h2>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, please ignore this message.</p>
    `,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('SendGrid send failed:', error.response?.body || error);
    const message = error.response?.body?.errors?.map(e => e.message).join('; ') || error.message;
    throw new Error(`SendGrid error: ${message}`);
  }
};

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


// ─── REGISTER ───────────────────────────────────────────
export const register = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { full_name, email, mobile, password, confirm_password } = req.body;

    // Validate required fields
    if (!full_name || !email || !mobile || !password || !confirm_password) {
      return errorResponse(res, 'All fields are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 'Invalid email format');
    }

    // Validate mobile (10 digits)
    if (!/^\d{10}$/.test(mobile)) {
      return errorResponse(res, 'Mobile must be 10 digits');
    }

    // Validate password strength
    if (password.length < 8) {
      return errorResponse(res, 'Password must be at least 8 characters');
    }

    // Check if passwords match
    if (password !== confirm_password) {
      return errorResponse(res, 'Passwords do not match');
    }

    // Check if email already exists
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      return errorResponse(res, 'Email already registered');
    }

    // Check if mobile already exists
    const existingMobile = await UserModel.findByMobile(mobile);
    if (existingMobile) {
      return errorResponse(res, 'Mobile number already registered');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await UserModel.create({
      full_name,
      email,
      mobile,
      password_hash,
      role: 'candidate'
    });

    // Generate OTP for email verification
    const otp = generateOTP();
    await UserModel.saveOTP(user.id, email, otp, 'email_verify');

    await sendOTPEmail(email, 'Verify your ExamPlatform email', otp);

    const token = generateToken(user.id, user.role);

    return successResponse(res, {
      user,
      token,
      otp_sent: true,
      // Remove this in production!
      dev_otp: process.env.NODE_ENV === 'development' ? otp : undefined
    }, 'Registration successful. Please verify your email.', 201);

  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 'Registration failed', 500);
  }
};

// ─── LOGIN ───────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required');
    }

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Check if active
    if (!user.is_active) {
      return errorResponse(res, 'Account is deactivated', 401);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user.id, user.role);

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    return successResponse(res, {
      user: userWithoutPassword,
      token
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
};

// ─── VERIFY OTP ──────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return errorResponse(res, 'Email and OTP are required');
    }

    const otpRecord = await UserModel.verifyOTP(email, otp, 'email_verify');
    if (!otpRecord) {
      return errorResponse(res, 'Invalid or expired OTP');
    }

    // Mark user as verified
    const user = await UserModel.verifyEmail(otpRecord.user_id);

    return successResponse(res, { user }, 'Email verified successfully');

  } catch (error) {
    console.error('Verify OTP error:', error);
    return errorResponse(res, 'Verification failed', 500);
  }
};

// ─── FORGOT PASSWORD ─────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Email is required');
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return errorResponse(res, 'No account found with that email');
    }

    const otp = generateOTP();
    await UserModel.saveOTP(user.id, email, otp, 'password_reset');

    await sendOTPEmail(email, 'Reset your ExamPlatform password', otp);

    return successResponse(res, {
      otp_sent: true,
      dev_otp: process.env.NODE_ENV === 'development' ? otp : undefined
    }, 'Password reset code sent');

  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse(res, 'Failed to send password reset code', 500);
  }
};

// ─── RESET PASSWORD ──────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirm_password } = req.body;

    if (!email || !otp || !password || !confirm_password) {
      return errorResponse(res, 'Email, OTP, and passwords are required');
    }

    if (password !== confirm_password) {
      return errorResponse(res, 'Passwords do not match');
    }

    if (password.length < 8) {
      return errorResponse(res, 'Password must be at least 8 characters');
    }

    const otpRecord = await UserModel.verifyOTP(email, otp, 'password_reset');
    if (!otpRecord) {
      return errorResponse(res, 'Invalid or expired reset code');
    }

    const password_hash = await bcrypt.hash(password, 10);
    await UserModel.updatePassword(otpRecord.user_id, password_hash);

    return successResponse(res, null, 'Password has been reset successfully');

  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse(res, 'Failed to reset password', 500);
  }
};

// ─── GET CURRENT USER ────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    return successResponse(res, { user }, 'User fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch user', 500);
  }
};