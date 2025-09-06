const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for development
  console.error(err);

  // Prisma errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    const message = `Duplicate field value: ${field}. Please use another value.`;
    error = new Error(message);
    error.statusCode = 400;
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    const message = 'Resource not found';
    error = new Error(message);
    error.statusCode = 404;
  }

  // Prisma foreign key constraint failed
  if (err.code === 'P2003') {
    const message = 'Foreign key constraint failed';
    error = new Error(message);
    error.statusCode = 400;
  }

  // Prisma validation error
  if (err.code === 'P2006' || err.code === 'P2007') {
    const message = 'The provided value for the column is invalid';
    error = new Error(message);
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = new Error(message);
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again.';
    error = new Error(message);
    error.statusCode = 401;
  }

  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
