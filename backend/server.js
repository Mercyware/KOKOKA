const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const path = require('path');

// Import configuration
const { connectDatabase } = require('./config/database');
const { initJwtConfig } = require('./config/jwt');
const env = require('./config/env');
const { setupSwagger } = require('./config/swagger');

// Import middleware
const errorHandler = require('./middlewares/errorHandler');
const { extractSchoolFromSubdomain } = require('./middlewares/schoolMiddleware');

// Import routes (temporarily limited for migration)
const authRoutes = require('./routes/authRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
// const studentRoutes = require('./routes/studentRoutes');
// const studentClassHistoryRoutes = require('./routes/studentClassHistoryRoutes');
// const teacherRoutes = require('./routes/teacherRoutes');
// const staffRoutes = require('./routes/staffRoutes');
// const timetableRoutes = require('./routes/timetableRoutes');
// const examRoutes = require('./routes/examRoutes');
// const feeRoutes = require('./routes/feeRoutes');
// const aiRoutes = require('./routes/aiRoutes');
// const academicYearRoutes = require('./routes/academicYearRoutes');
// const academicCalendarRoutes = require('./routes/academicCalendarRoutes');
// const termRoutes = require('./routes/termRoutes');
// const classRoutes = require('./routes/classRoutes');
// const subjectRoutes = require('./routes/subjectRoutes');
// const teacherSubjectAssignmentRoutes = require('./routes/teacherSubjectAssignmentRoutes');
// const classTeacherRoutes = require('./routes/classTeacherRoutes');
// const sittingPositionRoutes = require('./routes/sittingPositionRoutes');
// const houseRoutes = require('./routes/houseRoutes');
// const sectionRoutes = require('./routes/sectionRoutes');
// const departmentRoutes = require('./routes/departmentRoutes');
// const attendanceRoutes = require('./routes/attendanceRoutes');
// const assessmentRoutes = require('./routes/assessmentRoutes');
// const gradeRoutes = require('./routes/gradeRoutes');
// const documentRoutes = require('./routes/documentRoutes');
// const parentPortalRoutes = require('./routes/parentPortalRoutes');

// Import utilities
const logger = require('./utils/logger');

// Initialize environment and JWT configuration
env.initEnvConfig();
initJwtConfig();

// Create Express app
const app = express();

// Connect to PostgreSQL and Redis
connectDatabase();

// Middleware
// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser
app.use(cookieParser());

// CORS
app.use(cors({
  origin: '*',  // Allow all origins for development
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-School-Subdomain']
}));

// Security headers
if (env.HELMET_ENABLED) {
  app.use(helmet());
}

// Prevent XSS attacks
if (env.XSS_PROTECTION_ENABLED) {
  app.use(xss());
}

// Sanitize data to prevent NoSQL injection
app.use(mongoSanitize());

// Compress responses
app.use(compression());

// Request logging
app.use(morgan('combined', { stream: logger.stream }));
app.use(logger.logRequest);

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Maintenance mode
app.use((req, res, next) => {
  if (env.MAINTENANCE_MODE && req.path !== '/api/health') {
    return res.status(503).json({
      success: false,
      message: 'The server is currently under maintenance. Please try again later.'
    });
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Setup Swagger documentation
setupSwagger(app);

// Apply school subdomain middleware to all routes
app.use(extractSchoolFromSubdomain);

// Test endpoint for frontend-backend connection
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Frontend-Backend connection is working!',
    timestamp: new Date(),
    subdomain: req.headers['x-school-subdomain'] || 'none'
  });
});

// Debug: List all registered routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes });
});

// API routes (temporarily disabled for migration)
app.use('/api/schools', schoolRoutes); // School routes enabled
app.use('/api/auth', authRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api/student-class-history', studentClassHistoryRoutes);
// app.use('/api/teachers', teacherRoutes);
// app.use('/api/staff', staffRoutes);
// app.use('/api/timetables', timetableRoutes);
// app.use('/api/exams', examRoutes);
// app.use('/api/fees', feeRoutes);
// app.use('/api/academic-years', academicYearRoutes);
// app.use('/api/academic-calendars', academicCalendarRoutes);
// app.use('/api/terms', termRoutes);
// app.use('/api/classes', classRoutes);
// app.use('/api/subjects', subjectRoutes);
// app.use('/api/teacher-subject-assignments', teacherSubjectAssignmentRoutes);
// app.use('/api/class-teachers', classTeacherRoutes);
// app.use('/api/sitting-positions', sittingPositionRoutes);
// app.use('/api/houses', houseRoutes);
// app.use('/api/sections', sectionRoutes);
// app.use('/api/departments', departmentRoutes);
// app.use('/api/attendance', attendanceRoutes);
// app.use('/api/assessments', assessmentRoutes);
// app.use('/api/grades', gradeRoutes);
// app.use('/api/documents', documentRoutes);
// app.use('/api/parent-portal', parentPortalRoutes);

// AI routes (conditionally enabled)
// if (env.FEATURE_AI_ENABLED) {
//   app.use('/api/ai', aiRoutes);
// }

// Serve static assets in production
if (env.isProduction()) {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Serve frontend
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Handle unhandled routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Start server
const PORT = env.PORT;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  logger.logError(err, { component: 'server', type: 'unhandledRejection' });
  
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.logError(err, { component: 'server', type: 'uncaughtException' });
  
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = server;
