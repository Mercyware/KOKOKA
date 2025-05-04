const express = require('express');
const router = express.Router();

// Import middleware
const { protect } = require('../middlewares/authMiddleware');
const { requireSchool, scopeToSchool, filterBySchool } = require('../middlewares/schoolMiddleware');

/**
 * This file contains route middleware configurations that can be applied to
 * any route that needs to be scoped to a specific school.
 * 
 * Usage:
 * const schoolDataRoutes = require('./schoolDataRoutes');
 * 
 * // Apply school data middleware to your routes
 * router.use(schoolDataRoutes.requireSchoolMiddleware);
 * 
 * // Or for specific routes
 * router.get('/', schoolDataRoutes.requireSchoolMiddleware, yourController.method);
 */

// Middleware to require a valid school and protect routes
const requireSchoolMiddleware = [protect, requireSchool];

// Middleware to scope data to the current school (for POST/PUT requests)
const scopeToSchoolMiddleware = [protect, requireSchool, scopeToSchool];

// Middleware to filter queries by school (for GET requests)
const filterBySchoolMiddleware = [protect, requireSchool, filterBySchool];

module.exports = {
  requireSchoolMiddleware,
  scopeToSchoolMiddleware,
  filterBySchoolMiddleware
};
