const { Console } = require('winston/lib/winston/transports');
const School = require('../models/School');
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
      const school = await School.findOne({ 
        subdomain: headerSubdomain, 
        status: { $in: ['active', 'pending'] } // Allow both active and pending schools
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
      const school = await School.findOne({ 
        subdomain, 
        status: { $in: ['active', 'pending'] } // Allow both active and pending schools
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
 * and return an error if not
 */
exports.requireSchool = (req, res, next) => {
  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
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
    req.body.school = req.school._id;
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
    req.query.school = req.school._id;
  }
  
  next();
};
