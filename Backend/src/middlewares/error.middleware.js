const logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');

exports.errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return ApiResponse.badRequest(res, 'Validation error', errors);
  }

  if (err.name === 'CastError') {
    return ApiResponse.badRequest(res, 'Invalid ID format');
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return ApiResponse.conflict(res, `${field} already exists`);
  }

  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Token expired');
  }

  return ApiResponse.error(res, err.message || 'Internal server error');
};

exports.notFound = (req, res) => {
  return ApiResponse.notFound(res, 'Route not found');
};

exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};