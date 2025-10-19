const { userHelpers } = require('../utils/prismaHelpers');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const passport = require('../config/passport');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const emailConfig = require('../config/email');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await userHelpers.findByEmailWithPassword(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Get school from request (set by school middleware) or from request body
    const schoolId = req.school ? req.school.id : req.body.school;
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false,
        message: 'School ID is required' 
      });
    }
    
    // Create new user (password will be hashed automatically)
    const user = await userHelpers.create({
      schoolId,
      name,
      email,
      password,
      role
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        school: user.schoolId 
      }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        school: user.school
      }
    });
  } catch (error) {
    const logger = require('../utils/logger');
    logger.logError(error, { component: 'authController', operation: 'login' });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const logger = require('../utils/logger');
    const user = await userHelpers.findByEmailWithPassword(email);
    logger.info('Retrieved user:', { email, userId: user?.id });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await userHelpers.comparePassword(password, user.passwordHash);
    logger.info('Password match:', { isMatch });
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    await userHelpers.update(user.id, { lastLogin: new Date() });
    
    // Generate JWT token
    logger.info('JWT_SECRET configured');
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        school: user.schoolId 
      }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          school: user.school
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const { prisma } = require('../utils/prismaHelpers');
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        school: true,
        student: true,
        staff: true,
        guardian: true
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Logout user
exports.logout = (req, res) => {
  res.json({ message: 'User logged out successfully' });
};

// Google OAuth initiation
exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

// Google OAuth callback
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        school: user.schoolId 
      }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage
    }))}`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_error`);
  }
};

// LinkedIn OAuth initiation
exports.linkedinAuth = passport.authenticate('linkedin');

// LinkedIn OAuth callback
exports.linkedinCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        school: user.schoolId
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage
    }))}`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_error`);
  }
};

/**
 * Verify email with token
 * @route POST /api/auth/verify-email
 * @access Public
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExpiry: {
          gt: new Date()
        }
      },
      include: {
        school: true
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null
      }
    });

    logger.info(`Email verified for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: true
      }
    });
  } catch (error) {
    logger.error(`Email verification error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification',
      error: error.message
    });
  }
};

/**
 * Resend verification email
 * @route POST /api/auth/resend-verification
 * @access Public
 */
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        school: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + emailConfig.verification.tokenExpiry);

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiry: tokenExpiry
      }
    });

    // Send verification email
    if (emailConfig.enabled) {
      try {
        await emailService.sendVerificationEmail({
          email: user.email,
          name: user.name,
          verificationToken,
          schoolName: user.school?.name
        });

        logger.info(`Verification email resent to ${user.email}`);
      } catch (emailError) {
        logger.error(`Failed to send verification email: ${emailError.message}`);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email'
        });
      }
    } else {
      return res.status(503).json({
        success: false,
        message: 'Email service is not enabled'
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    logger.error(`Resend verification email error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during resend verification',
      error: error.message
    });
  }
};
