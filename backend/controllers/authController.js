const { userHelpers } = require('../utils/prismaHelpers');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

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
        teacher: true,
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
