const { prisma } = require('../config/database');
const { userHelpers } = require('../utils/prismaHelpers');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const bcrypt = require('bcryptjs');

/**
 * Register a new school
 * @route POST /api/schools/register
 * @access Public
 */
exports.registerSchool = async (req, res) => {
  try {
    const {
      name,
      subdomain,
      contactInfo,
      address,
      description,
      type,
      adminInfo
    } = req.body;

    // Check if school with same name or subdomain already exists
    const existingSchool = await prisma.school.findFirst({
      where: {
        OR: [
          { name },
          { subdomain }
        ]
      }
    });

    if (existingSchool) {
      return res.status(400).json({
        success: false,
        message: existingSchool.name === name 
          ? 'School with this name already exists' 
          : 'Subdomain is already taken'
      });
    }

    // Generate slug from school name
    const generateSlug = (name) => {
      return name
        .toLowerCase()
        .replace(/[^\w\s-]/gi, '') // Remove special characters
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-')       // Replace multiple hyphens with single
        .trim();
    };

    const slug = generateSlug(name);

    // Check if slug already exists
    const existingSlug = await prisma.school.findUnique({
      where: { slug }
    });

    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: 'School name already exists (slug conflict)'
      });
    }

    // Create new school
    const school = await prisma.school.create({
      data: {
        name,
        slug,
        subdomain: subdomain || undefined,
        email: contactInfo?.email,
        phone: contactInfo?.phone,
        website: contactInfo?.website,
        streetAddress: address?.street,
        city: address?.city,
        state: address?.state,
        zipCode: address?.zipCode,
        country: address?.country,
        description,
        type: type || 'SECONDARY',
        status: 'PENDING'
      }
    });
    
    // Create admin user for the school
    if (adminInfo) {
      const { name: adminName, email, password } = adminInfo;
      
      // Check if user already exists
      const existingUser = await userHelpers.findByEmailWithPassword(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Admin email already in use'
        });
      }
      
      // Create admin user
      const admin = await userHelpers.create({
        schoolId: school.id,
        name: adminName,
        email,
        password,
        role: 'ADMIN'
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { id: admin.id, role: admin.role, schoolId: school.id },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      res.status(201).json({
        success: true,
        message: 'School registered successfully and pending approval',
        school: {
          id: school.id,
          name: school.name,
          subdomain: school.subdomain,
          status: school.status
        },
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email
        },
        token
      });
    } else {
      res.status(201).json({
        success: true,
        message: 'School registered successfully and pending approval',
        school: {
          id: school.id,
          name: school.name,
          subdomain: school.subdomain,
          status: school.status
        }
      });
    }
    
    logger.info(`New school registered: ${school.name} (${school.subdomain})`);
  } catch (error) {
    logger.error(`School registration error: ${error.message}`);
    logger.logError(error, { component: 'controller', operation: 'registerSchool' });
    
    res.status(500).json({
      success: false,
      message: 'Server error during school registration',
      error: error.message
    });
  }
};

/**
 * Check if a subdomain is available
 * @route GET /api/schools/check-subdomain/:subdomain
 * @access Public
 */
exports.checkSubdomainAvailability = async (req, res) => {
  try {
    const { subdomain } = req.params;
    
    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!subdomainRegex.test(subdomain)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens.',
        available: false
      });
    }
    
    // Check if subdomain exists
    const existingSchool = await prisma.school.findFirst({
      where: { subdomain }
    });
    
    res.json({
      success: true,
      available: !existingSchool,
      message: existingSchool 
        ? 'Subdomain is already taken' 
        : 'Subdomain is available'
    });
  } catch (error) {
    logger.error(`Subdomain check error: ${error.message}`);
    logger.logError(error, { component: 'controller', operation: 'checkSubdomainAvailability' });
    
    res.status(500).json({
      success: false,
      message: 'Server error checking subdomain availability',
      error: error.message
    });
  }
};

/**
 * Get all schools
 * @route GET /api/schools
 * @access Private (Super Admin)
 */
exports.getAllSchools = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subdomain: { $regex: search, $options: 'i' } },
        { 'contactInfo.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get schools
    const schools = await School.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-settings.theme -subscription.paymentId');
    
    // Get total count
    const total = await School.countDocuments(query);
    
    res.json({
      success: true,
      count: schools.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      schools
    });
  } catch (error) {
    logger.error(`Get all schools error: ${error.message}`);
    logger.logError(error, { component: 'controller', operation: 'getAllSchools' });
    
    res.status(500).json({
      success: false,
      message: 'Server error retrieving schools',
      error: error.message
    });
  }
};

/**
 * Get school by ID
 * @route GET /api/schools/:id
 * @access Private (Super Admin)
 */
exports.getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }
    
    // Get admin users for this school
    const admins = await User.find({ 
      school: school._id,
      role: 'admin'
    }).select('name email lastLogin');
    
    res.json({
      success: true,
      school,
      admins
    });
  } catch (error) {
    logger.error(`Get school by ID error: ${error.message}`);
    logger.logError(error, { component: 'controller', operation: 'getSchoolById' });
    
    res.status(500).json({
      success: false,
      message: 'Server error retrieving school',
      error: error.message
    });
  }
};

/**
 * Update school
 * @route PUT /api/schools/:id
 * @access Private (Super Admin)
 */
exports.updateSchool = async (req, res) => {
  try {
    const {
      name,
      subdomain,
      contactInfo,
      address,
      description,
      type,
      settings
    } = req.body;
    
    const school = await School.findById(req.params.id);
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }
    
    // Check if subdomain is being changed and if it's available
    if (subdomain && subdomain !== school.subdomain) {
      const existingSchool = await School.findOne({ 
        subdomain,
        _id: { $ne: school._id }
      });
      
      if (existingSchool) {
        return res.status(400).json({
          success: false,
          message: 'Subdomain is already taken'
        });
      }
    }
    
    // Update fields
    if (name) school.name = name;
    if (subdomain) school.subdomain = subdomain;
    if (contactInfo) school.contactInfo = { ...school.contactInfo, ...contactInfo };
    if (address) school.address = { ...school.address, ...address };
    if (description) school.description = description;
    if (type) school.type = type;
    if (settings) {
      // Merge settings objects
      school.settings = {
        ...school.settings,
        ...settings,
        theme: settings.theme 
          ? { ...school.settings.theme, ...settings.theme }
          : school.settings.theme,
        grading: settings.grading
          ? { ...school.settings.grading, ...settings.grading }
          : school.settings.grading,
        academicYear: settings.academicYear
          ? { ...school.settings.academicYear, ...settings.academicYear }
          : school.settings.academicYear,
        features: settings.features
          ? { ...school.settings.features, ...settings.features }
          : school.settings.features
      };
    }
    
    school.updatedAt = Date.now();
    
    await school.save();
    
    res.json({
      success: true,
      message: 'School updated successfully',
      school
    });
  } catch (error) {
    logger.error(`Update school error: ${error.message}`);
    logger.logError(error, { component: 'controller', operation: 'updateSchool' });
    
    res.status(500).json({
      success: false,
      message: 'Server error updating school',
      error: error.message
    });
  }
};

/**
 * Delete school
 * @route DELETE /api/schools/:id
 * @access Private (Super Admin)
 */
exports.deleteSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }
    
    // Instead of deleting, mark as inactive
    school.status = 'inactive';
    school.updatedAt = Date.now();
    
    await school.save();
    
    res.json({
      success: true,
      message: 'School marked as inactive'
    });
  } catch (error) {
    logger.error(`Delete school error: ${error.message}`);
    logger.logError(error, { component: 'controller', operation: 'deleteSchool' });
    
    res.status(500).json({
      success: false,
      message: 'Server error deleting school',
      error: error.message
    });
  }
};

/**
 * Update school status
 * @route PUT /api/schools/:id/status
 * @access Private (Super Admin)
 */
exports.updateSchoolStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'pending', 'suspended', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const school = await School.findById(req.params.id);
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }
    
    school.status = status;
    school.updatedAt = Date.now();
    
    await school.save();
    
    res.json({
      success: true,
      message: `School status updated to ${status}`,
      school: {
        id: school._id,
        name: school.name,
        status: school.status
      }
    });
  } catch (error) {
    logger.error(`Update school status error: ${error.message}`);
    logger.logError(error, { component: 'controller', operation: 'updateSchoolStatus' });
    
    res.status(500).json({
      success: false,
      message: 'Server error updating school status',
      error: error.message
    });
  }
};

/**
 * Update school subscription
 * @route PUT /api/schools/:id/subscription
 * @access Private (Super Admin)
 */
exports.updateSchoolSubscription = async (req, res) => {
  try {
    const { plan, status, startDate, endDate, paymentMethod, paymentId } = req.body;
    
    const school = await School.findById(req.params.id);
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }
    
    // Update subscription fields
    if (plan) school.subscription.plan = plan;
    if (status) school.subscription.status = status;
    if (startDate) school.subscription.startDate = startDate;
    if (endDate) school.subscription.endDate = endDate;
    if (paymentMethod) school.subscription.paymentMethod = paymentMethod;
    if (paymentId) school.subscription.paymentId = paymentId;
    
    school.updatedAt = Date.now();
    
    await school.save();
    
    res.json({
      success: true,
      message: 'School subscription updated',
      subscription: school.subscription
    });
  } catch (error) {
    logger.error(`Update school subscription error: ${error.message}`);
    logger.logError(error, { component: 'controller', operation: 'updateSchoolSubscription' });
    
    res.status(500).json({
      success: false,
      message: 'Server error updating school subscription',
      error: error.message
    });
  }
};
