const { clerk } = require('../config/clerk');
const User = require('../modules/users/models/user.model');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

exports.protect = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      token = req.headers['x-clerk-token'];
    }

    if (!token) {
      return ApiResponse.unauthorized(res, 'Authentication required. No token provided.');
    }

    const claims = await clerk.verifyToken(token);

    if (!claims || !claims.sub) {
      return ApiResponse.unauthorized(res, 'Invalid or expired token.');
    }

    const clerkUser = await clerk.getUser(claims.sub);

    if (!clerkUser) {
      return ApiResponse.unauthorized(res, 'User not found in Clerk.');
    }

    let user = await User.findOne({ clerkId: claims.sub });

    const isNewUser = !user;

    if (!user) {
      user = await User.create({
        clerkId: claims.sub,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        imageUrl: clerkUser.imageUrl || '',
        username: clerkUser.username || `user_${claims.sub.slice(0, 8)}`,
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    req.auth = {
      user,
      claims,
      clerkUser,
      isNewUser,
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return ApiResponse.unauthorized(res, 'Authentication failed.');
  }
};

exports.requireAuth = exports.protect;

exports.optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    const claims = await clerk.verifyToken(token);

    if (!claims || !claims.sub) {
      return next();
    }

    const user = await User.findOne({ clerkId: claims.sub });

    if (user && !user.isBanned) {
      req.auth = { user, claims };
    }

    next();
  } catch (error) {
    logger.warn('Optional auth error:', error.message);
    next();
  }
};

exports.requireAdmin = async (req, res, next) => {
  if (!req.auth?.user) {
    return ApiResponse.unauthorized(res, 'Authentication required.');
  }

  if (req.auth.user.role !== 'admin') {
    return ApiResponse.forbidden(res, 'Admin access required.');
  }

  next();
};