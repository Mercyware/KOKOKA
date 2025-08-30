const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Middleware to extract school information from subdomain
 * This middleware will check if the request is coming from a school-specific subdomain
 * and attach the school information to the request object
 */
exports.extractSchoolFromSubdomain = async (req, res, next) => {
  try {
    // Check for X-School-Subdomain header first (used by frontend in development)
    const headerSubdomain = req.headers['x-school-subdomain'];
    
    console.log(`Header subdomain: ${headerSubdomain}`);
    if (headerSubdomain) {
      // Find school by subdomain from header
      const school = await prisma.school.findFirst({ 
        where: {
          subdomain: headerSubdomain,
          status: { in: ['ACTIVE', 'PENDING'] } // Allow both active and pending schools
        }
      });
      
      console.log(`Found school from header: ${school ? school.name : 'None'}`);
      if (school) {
        // Attach school to request object
        req.school = school;
        logger.info(`Request for school from header: ${school.name} (${headerSubdomain})`);
        return next();
      } else {
        logger.warn(`Invalid subdomain in header: ${headerSubdomain}`);
      }
    }
    
    // Get host from request headers
    const host = req.headers.host;
    
    // Skip for direct API access or main domain
    if (!host || host.startsWith('localhost') || host.startsWith('127.0.0.1') || host === process.env.MAIN_DOMAIN) {
      return next();
    }
    
    // Extract subdomain from host
    // Example: school.domain.com -> subdomain = school
    const hostParts = host.split('.');
    
    // If we have a subdomain (e.g., school.domain.com has 3+ parts)
    if (hostParts.length >= 3) {
      const subdomain = hostParts[0].toLowerCase();
      
      // Find school by subdomain
      const school = await prisma.school.findFirst({ 
        where: {
          subdomain, 
          status: { in: ['ACTIVE', 'PENDING'] } // Allow both active and pending schools
        }
      });
      
      if (school) {
        // Attach school to request object
        req.school = school;
        logger.info(`Request for school from host: ${school.name} (${subdomain})`);
      } else {
        logger.warn(`Invalid subdomain accessed: ${subdomain}`);
      }
    }
    
    next();
  } catch (error) {
    logger.error(`Error in subdomain middleware: ${error.message}`);
    logger.logError(error, { component: 'middleware', operation: 'extractSchoolFromSubdomain' });
    next();
  }
};

/**
 * Middleware to require a valid school
 * This middleware will check if the request has a school attached
 * and if the school is valid (status === 'ACTIVE' or 'PENDING')
 * Schools with PENDING status can still manage their settings
 */
exports.requireSchool = (req, res, next) => {
  if (!req.school || !['ACTIVE', 'PENDING'].includes(req.school.status)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or inactive school. Access denied.'
    });
  }
  
  next();
};

/**
 * Middleware to ensure data is scoped to the current school
 * This middleware will add the school ID to the request body
 * to ensure all created data is associated with the correct school
 */
exports.scopeToSchool = (req, res, next) => {
  if (req.school && req.body) {
    // Add school ID to request body
    req.body.schoolId = req.school.id;
  }
  
  next();
};

/**
 * Middleware to filter query by school
 * This middleware will modify query parameters to include the school ID
 * to ensure only data from the current school is returned
 */
exports.filterBySchool = (req, res, next) => {
  if (req.school && req.query) {
    // Add school filter to query
    req.query.schoolId = req.school.id;
  }
  
  next();
};
