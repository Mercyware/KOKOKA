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

/**
 * Get current school settings
 * @route GET /api/schools/settings
 * @access Private (School Admin)
 */
exports.getSchoolSettings = async (req, res) => {
  try {
    if (!req.school || !req.school.id) {
      return res.status(400).json({
        success: false,
        message: 'School context not found'
      });
    }

    const school = await prisma.school.findUnique({
      where: { id: req.school.id },
      select: {
        id: true,
        name: true,
        subdomain: true,
        logo: true,
        description: true,
        established: true,
        type: true,
        status: true,
        email: true,
        phone: true,
        website: true,
        streetAddress: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        settings: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    res.json({
      success: true,
      school
    });
  } catch (error) {
    logger.error(`Get school settings error: ${error.message}`);
    logger.logError(error, { component: 'controller', operation: 'getSchoolSettings' });

    res.status(500).json({
      success: false,
      message: 'Server error fetching school settings',
      error: error.message
    });
  }
};

/**
 * Update school settings
 * @route PUT /api/schools/settings
 * @access Private (School Admin)
 */
exports.updateSchoolSettings = async (req, res) => {
  try {
    if (!req.school || !req.school.id) {
      return res.status(400).json({
        success: false,
        message: 'School context not found'
      });
    }

    const {
      // General Information
      name,
      logo,
      description,
      established,
      type,
      email,
      phone,
      website,
      streetAddress,
      city,
      state,
      zipCode,
      country,
      // Settings Object
      settings
    } = req.body;

    // Build update data object
    const updateData = {};

    // General information updates
    if (name !== undefined) updateData.name = name;
    if (logo !== undefined) updateData.logo = logo;
    if (description !== undefined) updateData.description = description;
    if (established !== undefined) updateData.established = new Date(established);
    if (type !== undefined) updateData.type = type;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (website !== undefined) updateData.website = website;
    if (streetAddress !== undefined) updateData.streetAddress = streetAddress;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zipCode !== undefined) updateData.zipCode = zipCode;
    if (country !== undefined) updateData.country = country;

    // Settings updates (merge with existing settings)
    if (settings !== undefined) {
      const currentSchool = await prisma.school.findUnique({
        where: { id: req.school.id },
        select: { settings: true }
      });

      updateData.settings = {
        ...(currentSchool.settings || {}),
        ...settings
      };
    }

    // Update the school
    const updatedSchool = await prisma.school.update({
      where: { id: req.school.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        subdomain: true,
        logo: true,
        description: true,
        established: true,
        type: true,
        status: true,
        email: true,
        phone: true,
        website: true,
        streetAddress: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        settings: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'School settings updated successfully',
      school: updatedSchool
    });
  } catch (error) {
    logger.error(`Update school settings error: ${error.message}`);
    logger.logError(error, { component: 'controller', operation: 'updateSchoolSettings' });

    res.status(500).json({
      success: false,
      message: 'Server error updating school settings',
      error: error.message
    });
  }
};

/**
 * Get school logo from S3
 * @route GET /api/schools/logo/:schoolId
 * @access Public
 */
exports.getSchoolLogo = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { S3Client, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const bucket = process.env.AWS_S3_BUCKET_NAME;
    const prefix = `${schoolId}/school-logo/`;

    // List objects to find the latest logo
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: 1
    });

    const listResponse = await s3Client.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'School logo not found'
      });
    }

    // Get the latest logo file
    const logoKey = listResponse.Contents[0].Key;
    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: logoKey
    });

    const response = await s3Client.send(getCommand);

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Stream the image
    response.Body.pipe(res);
  } catch (error) {
    logger.error(`Get school logo error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve school logo'
    });
  }
};

/**
 * Upload school logo
 * @route POST /api/schools/settings/upload-logo
 * @access Private (School Admin)
 */
exports.uploadSchoolLogo = async (req, res) => {
  try {
    if (!req.school || !req.school.id) {
      return res.status(400).json({
        success: false,
        message: 'School context not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileUploadService = require('../utils/fileUploadService');
    const sharp = require('sharp');
    const path = require('path');

    // Validate image
    const validation = await fileUploadService.validateImage(req.file.buffer, {
      maxSize: 5242880, // 5MB
      minWidth: 100,
      minHeight: 100,
      maxWidth: 2000,
      maxHeight: 2000
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // Optimize logo
    const optimizedImage = await fileUploadService.optimizeImage(req.file.buffer, {
      width: 500,
      height: 500,
      quality: 90,
      format: 'png'
    });

    // Upload to S3 directly without FileManager record
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const bucket = process.env.AWS_S3_BUCKET_NAME;
    const fileName = `${req.school.id}/school-logo/${Date.now()}_${req.school.id}.png`;

    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: optimizedImage,
      ContentType: 'image/png',
      ACL: 'public-read', // Ensure the image is publicly readable
      Metadata: {
        'schoolId': req.school.id,
        'uploadedBy': req.user.id
      }
    }));

    // Construct the full S3 URL using the public URL from environment
    const logoUrl = `${process.env.AWS_S3_PUBLIC_URL}/${fileName}`;

    // Update school logo URL
    const updatedSchool = await prisma.school.update({
      where: { id: req.school.id },
      data: { logo: logoUrl },
      select: {
        id: true,
        name: true,
        subdomain: true,
        logo: true
      }
    });

    res.json({
      success: true,
      message: 'School logo uploaded successfully',
      logo: logoUrl,
      school: updatedSchool
    });
  } catch (error) {
    logger.error(`Upload school logo error: ${error.message}`);
    logger.logError(error, { component: 'controller', operation: 'uploadSchoolLogo' });

    res.status(500).json({
      success: false,
      message: error.message || 'Server error uploading school logo',
      error: error.message
    });
  }
};

/**
 * Get school branding info by subdomain (public endpoint for login page)
 * @route GET /api/schools/branding/:subdomain
 * @access Public
 */
exports.getSchoolBranding = async (req, res) => {
  try {
    const { subdomain } = req.params;

    if (!subdomain) {
      return res.status(400).json({
        success: false,
        message: 'Subdomain is required'
      });
    }

    // Find school by subdomain
    const school = await prisma.school.findFirst({
      where: {
        subdomain: subdomain.toLowerCase().trim(),
        status: { in: ['ACTIVE', 'PENDING'] }
      },
      select: {
        id: true,
        name: true,
        subdomain: true,
        settings: true,
        email: true,
        phone: true,
        website: true
      }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Check if logo exists (optional - can remove logo URL if not configured)
    // For now, we'll include it and let the frontend handle the fallback
    const logoUrl = school.settings?.logoUrl || null;

    // Return branding information
    res.json({
      success: true,
      school: {
        id: school.id,
        name: school.name,
        subdomain: school.subdomain,
        logo: logoUrl, // Only return if logoUrl is set in settings
        primaryColor: school.settings?.theme?.primaryColor || '#3B82F6',
        secondaryColor: school.settings?.theme?.secondaryColor || '#8B5CF6',
        contactEmail: school.email || null,
        contactPhone: school.phone || null,
        website: school.website || null
      }
    });
  } catch (error) {
    logger.error(`Get school branding error: ${error.message}`);
    logger.logError(error, { component: 'controller', operation: 'getSchoolBranding' });

    res.status(500).json({
      success: false,
      message: 'Server error fetching school branding',
      error: error.message
    });
  }
};

