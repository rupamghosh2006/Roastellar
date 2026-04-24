const { clerk } = require('../config/clerk');
const User = require('../modules/users/models/user.model');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

function canUseDevFallback() {
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_AUTH_FALLBACK === 'true';
}

function buildUserSeed(claims, clerkUser) {
  const emailFromClaims =
    claims?.email ||
    claims?.email_address ||
    claims?.primary_email_address ||
    '';

  const firstName =
    clerkUser?.firstName ||
    claims?.given_name ||
    claims?.first_name ||
    '';

  const lastName =
    clerkUser?.lastName ||
    claims?.family_name ||
    claims?.last_name ||
    '';

  const imageUrl =
    clerkUser?.imageUrl ||
    claims?.picture ||
    claims?.image_url ||
    '';

  const username =
    clerkUser?.username ||
    claims?.username ||
    (claims?.sub ? `user_${claims.sub.slice(0, 8)}` : 'player');

  const email =
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    emailFromClaims ||
    `${username}@local.roastellar.dev`;

  return {
    email,
    firstName,
    lastName,
    imageUrl,
    avatar: imageUrl,
    name: [firstName, lastName].filter(Boolean).join(' ') || username,
    username,
  };
}

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
      logger.warn('Auth rejected: no token provided', {
        path: req.originalUrl,
        method: req.method,
      });
      return ApiResponse.unauthorized(res, 'Authentication required. No token provided.');
    }

    const claims = await clerk.verifyToken(token, {
      origin: req.headers.origin,
      referer: req.headers.referer,
      host: req.headers.host ? `${req.protocol}://${req.headers.host}` : '',
    });

    if (!claims || !claims.sub) {
      logger.warn('Auth rejected: invalid or expired Clerk token', {
        path: req.originalUrl,
        method: req.method,
        tokenPreview: `${token.slice(0, 12)}...`,
      });
      return ApiResponse.unauthorized(res, 'Invalid or expired token.');
    }

    let clerkUser = await clerk.getUser(claims.sub);

    if (!clerkUser && !canUseDevFallback()) {
      logger.warn('Auth rejected: Clerk user not found', {
        path: req.originalUrl,
        method: req.method,
        clerkUserId: claims.sub,
      });
      return ApiResponse.unauthorized(res, 'User not found in Clerk.');
    }

    if (!clerkUser && canUseDevFallback()) {
      logger.warn('Auth fallback: using decoded Clerk claims without Clerk user lookup', {
        path: req.originalUrl,
        method: req.method,
        clerkUserId: claims.sub,
      });
    }

    let user = await User.findOne({ clerkId: claims.sub });

    const isNewUser = !user;
    const userSeed = buildUserSeed(claims, clerkUser);

    if (!user) {
      user = await User.create({
        clerkId: claims.sub,
        ...userSeed,
      });
    } else if (canUseDevFallback()) {
      user.email = user.email || userSeed.email;
      user.firstName = user.firstName || userSeed.firstName;
      user.lastName = user.lastName || userSeed.lastName;
      user.imageUrl = user.imageUrl || userSeed.imageUrl;
      user.avatar = user.avatar || userSeed.avatar;
      user.name = user.name || userSeed.name;
      user.username = user.username || userSeed.username;
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
    logger.error('Auth middleware error:', {
      message: error?.message,
      path: req.originalUrl,
      method: req.method,
    });
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

    const claims = await clerk.verifyToken(token, {
      origin: req.headers.origin,
      referer: req.headers.referer,
      host: req.headers.host ? `${req.protocol}://${req.headers.host}` : '',
    });

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
