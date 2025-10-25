const { userHelpers } = require('../utils/prismaHelpers');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const passport = require('../config/passport');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const emailConfig = require('../config/email');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

// Helper function to generate tokens
const generateTokens = (userId, userRole, schoolId) => {
  // Generate access token (short-lived)
  const accessToken = jwt.sign(
    {
      id: userId,
      role: userRole,
      school: schoolId
    },
    JWT_SECRET,
    { expiresIn: '15m' } // 15 minutes
  );

  // Generate refresh token (long-lived)
  const refreshToken = crypto.randomBytes(64).toString('hex');

  return { accessToken, refreshToken };
};

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

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.schoolId);

    // Save refresh token to database
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days

    await userHelpers.update(user.id, {
      refreshToken,
      refreshTokenExpiry
    });

    res.status(201).json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted,
        onboardingStep: user.onboardingStep,
        onboardingData: user.onboardingData,
        school: user.school
      }
    });
  } catch (error) {
    const logger = require('../utils/logger');
    logger.logError(error, { component: 'authController', operation: 'register' });
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

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.schoolId);

    // Save refresh token to database
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days

    await userHelpers.update(user.id, {
      lastLogin: new Date(),
      refreshToken,
      refreshTokenExpiry
    });

    logger.info('JWT_SECRET configured');

    res.json({
      success: true,
      data: {
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          isActive: user.isActive,
          lastLogin: new Date(),
          profileImage: user.profileImage,
          onboardingCompleted: user.onboardingCompleted,
          onboardingStep: user.onboardingStep,
          onboardingData: user.onboardingData,
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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // Clear refresh token from database
    if (req.user && req.user.id) {
      await userHelpers.update(req.user.id, {
        refreshToken: null,
        refreshTokenExpiry: null
      });

      logger.info(`User logged out: ${req.user.email}`);
    }

    res.json({
      success: true,
      message: 'User logged out successfully'
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message
    });
  }
};

/**
 * Refresh access token using refresh token
 * @route POST /api/auth/refresh-token
 * @access Public
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Find user with this refresh token
    const user = await prisma.user.findFirst({
      where: {
        refreshToken,
        refreshTokenExpiry: {
          gt: new Date()
        }
      },
      include: {
        school: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is not active'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role, user.schoolId);

    // Update refresh token in database
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days

    await userHelpers.update(user.id, {
      refreshToken: newRefreshToken,
      refreshTokenExpiry
    });

    logger.info(`Refresh token renewed for user: ${user.email}`);

    res.json({
      success: true,
      data: {
        token: accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          profileImage: user.profileImage,
          onboardingCompleted: user.onboardingCompleted,
          onboardingStep: user.onboardingStep,
          onboardingData: user.onboardingData,
          school: user.school
        }
      }
    });
  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh',
      error: error.message
    });
  }
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

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.schoolId);

    // Save refresh token to database
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days

    await userHelpers.update(user.id, {
      refreshToken,
      refreshTokenExpiry,
      lastLogin: new Date()
    });

    // Fetch complete user data with school information
    const { prisma } = require('../utils/prismaHelpers');
    const completeUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            status: true
          }
        }
      }
    });

    // Redirect to frontend with tokens and complete user data
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}&user=${encodeURIComponent(JSON.stringify({
      id: completeUser.id,
      name: completeUser.name,
      email: completeUser.email,
      role: completeUser.role,
      profileImage: completeUser.profileImage,
      school: completeUser.school
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

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.schoolId);

    // Save refresh token to database
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days

    await userHelpers.update(user.id, {
      refreshToken,
      refreshTokenExpiry,
      lastLogin: new Date()
    });

    // Fetch complete user data with school information
    const { prisma } = require('../utils/prismaHelpers');
    const completeUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            status: true
          }
        }
      }
    });

    // Redirect to frontend with tokens and complete user data
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}&user=${encodeURIComponent(JSON.stringify({
      id: completeUser.id,
      name: completeUser.name,
      email: completeUser.email,
      role: completeUser.role,
      profileImage: completeUser.profileImage,
      school: completeUser.school
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

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 */
exports.forgotPassword = async (req, res) => {
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

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetTokenExpiry: resetTokenExpiry
      }
    });

    // Send password reset email
    if (emailConfig.enabled) {
      try {
        await emailService.sendPasswordResetEmail({
          email: user.email,
          name: user.name,
          resetToken,
          schoolName: user.school?.name
        });

        logger.info(`Password reset email sent to ${user.email}`);
      } catch (emailError) {
        logger.error(`Failed to send password reset email: ${emailError.message}`);
        // Don't expose email sending errors to user
      }
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request',
      error: error.message
    });
  }
};

/**
 * Reset password with token
 * @route POST /api/auth/reset-password
 * @access Public
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Update password and clear reset token
    await userHelpers.update(user.id, {
      password, // Will be hashed by userHelpers
      passwordResetToken: null,
      passwordResetTokenExpiry: null
    });

    logger.info(`Password reset successful for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset',
      error: error.message
    });
  }
};

/**
 * Change password (for authenticated users)
 * @route POST /api/auth/change-password
 * @access Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await userHelpers.findByEmailWithPassword(req.user.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await userHelpers.comparePassword(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update to new password
    await userHelpers.update(user.id, {
      password: newPassword // Will be hashed by userHelpers
    });

    logger.info(`Password changed successfully for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during password change',
      error: error.message
    });
  }
};

/**
 * Update onboarding progress
 * @route PUT /api/auth/onboarding
 * @access Protected
 */
exports.updateOnboardingProgress = async (req, res) => {
  try {
    const { step, completed, data } = req.body;

    const updates = {};

    if (typeof step === 'number') {
      updates.onboardingStep = step;
    }

    if (typeof completed === 'boolean') {
      updates.onboardingCompleted = completed;
    }

    if (data) {
      updates.onboardingData = data;
    }

    const user = await userHelpers.update(req.user.id, updates);

    logger.info(`Onboarding progress updated for user: ${req.user.email}`);

    res.json({
      success: true,
      data: {
        onboardingCompleted: user.onboardingCompleted,
        onboardingStep: user.onboardingStep,
        onboardingData: user.onboardingData,
      },
    });
  } catch (error) {
    logger.error(`Onboarding update error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during onboarding update',
      error: error.message,
    });
  }
};
