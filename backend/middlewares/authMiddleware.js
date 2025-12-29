const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { prisma } = require('../config/database');
const { JWT_SECRET } = require('../config/jwt');
const logger = require('../utils/logger');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    // Get client IP for logging
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    let token;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Get token from cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Get token from query parameter (for PDF downloads and similar)
    else if (req.query && req.query.token) {
      token = req.query.token;
    }

    // Check if token exists
    if (!token) {
      logger.warn(`Unauthorized access attempt from IP: ${clientIp}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(token, JWT_SECRET);
    } catch (jwtError) {
      logger.warn(`Invalid token from IP: ${clientIp}`, { error: jwtError.message });
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    });

    if (!user) {
      logger.warn(`Token for non-existent user from IP: ${clientIp}`, { userId: decoded.id });
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn(`Inactive user login attempt: ${user.email} from IP: ${clientIp}`);
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Note: School activation check is handled by requireActiveSchool middleware
    // Some routes like /auth/me, /auth/logout need to work regardless of school status
    // so they don't use requireActiveSchool middleware

    // Check if email is verified (optional - can be enabled based on requirements)
    // Uncomment the following if email verification is mandatory
    // if (!user.emailVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Please verify your email address to access this resource'
    //   });
    // }

    // Update last login time asynchronously (don't await to avoid blocking)
    prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    }).catch(err => logger.error(`Failed to update lastLogin for user ${user.id}:`, err));

    // Set user in request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      emailVerified: user.emailVerified
    };

    // If token has school info but user doesn't match, reject
    if (decoded.schoolId && user.schoolId && decoded.schoolId !== user.schoolId) {
      logger.error(`School mismatch for user ${user.email}: token school ${decoded.schoolId} vs user school ${user.schoolId}`);
      return res.status(401).json({
        success: false,
        message: 'User does not belong to the specified school'
      });
    }

    next();
  } catch (error) {
    logger.error('Authentication error:', { error: error.message, stack: error.stack });
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Authorize roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    // Flatten roles in case an array is passed instead of individual arguments
    const flatRoles = roles.flat();
    
    // Convert both user role and expected roles to lowercase for case-insensitive comparison
    const userRole = req.user.role?.toLowerCase();
    const allowedRoles = flatRoles.map(role => typeof role === 'string' ? role.toLowerCase() : role);
    
    // Check if user has a valid role
    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'User has no assigned role'
      });
    }
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    next();
  };
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // Verify refresh token
    const decoded = await promisify(jwt.verify)(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    
    // Generate new access token
    const token = jwt.sign(
      { id: user.id, role: user.role, schoolId: user.schoolId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      success: true,
      token
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      error: error.message
    });
  }
};

// Middleware to require active school (can be applied selectively)
exports.requireActiveSchool = async (req, res, next) => {
  try {
    // User should already be authenticated by protect middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get full user with school info
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    });

    // Check if school exists and is active
    if (!user.school) {
      return res.status(403).json({
        success: false,
        message: 'User must belong to a school'
      });
    }

    if (user.school.status !== 'ACTIVE') {
      logger.warn(`Access blocked - School not active: ${user.school.name} (${user.school.status}) for user: ${user.email}`);
      return res.status(403).json({
        success: false,
        message: 'School account must be activated to access this resource',
        schoolStatus: user.school.status,
        schoolName: user.school.name
      });
    }

    next();
  } catch (error) {
    logger.error('School activation check error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error checking school activation status'
    });
  }
};
