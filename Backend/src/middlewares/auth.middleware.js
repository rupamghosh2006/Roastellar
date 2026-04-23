const authService = require('../modules/auth/services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

exports.protect = async (req, res, next) => {
  try {
    let user;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      user = await authService.getUserByFirebaseUid(decoded.uid);
    }

    if (!user) {
      const firebaseUid = req.headers['x-firebase-uid'];
      if (firebaseUid) {
        user = await authService.getUserByFirebaseUid(firebaseUid);
      }
    }

    if (!user) {
      return ApiResponse.unauthorized(res, 'Not authorized');
    }

    if (user.isBanned) {
      return ApiResponse.forbidden(res, 'Account is banned');
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return ApiResponse.unauthorized(res, 'Not authorized');
  }
};

exports.requireAdmin = async (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return ApiResponse.forbidden(res, 'Admin access required');
  }
  next();
};

exports.optionalAuth = async (req, res, next) => {
  try {
    const firebaseUid = req.headers['x-firebase-uid'];
    if (firebaseUid) {
      const user = await authService.getUserByFirebaseUid(firebaseUid);
      if (user && !user.isBanned) {
        req.user = user;
      }
    }
  } catch (error) {
    logger.warn('Optional auth failed:', error.message);
  }
  next();
};