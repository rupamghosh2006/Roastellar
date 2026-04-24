const User = require('../models/user.model');
const ApiResponse = require('../../../utils/apiResponse');
const logger = require('../../../utils/logger');

function normalizeUsername(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.getMe = async (req, res) => {
  try {
    const user = req.auth.user;
    return ApiResponse.success(res, user.toPublicJSON());
  } catch (error) {
    logger.error('Get me error:', error);
    return ApiResponse.error(res, error.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, firstName, lastName, profileCid } = req.body;
    const user = req.auth.user;

    const updates = {};

    if (username !== undefined) {
      const normalizedUsername = normalizeUsername(username);
      if (!normalizedUsername) {
        return ApiResponse.badRequest(res, 'Username cannot be empty');
      }

      if (!/^[a-zA-Z0-9_]{3,20}$/.test(normalizedUsername)) {
        return ApiResponse.badRequest(res, 'Username must be 3-20 chars and use letters, numbers, or underscore');
      }

      const existingUser = await User.findOne({
        _id: { $ne: user._id },
        username: { $regex: `^${escapeRegex(normalizedUsername)}$`, $options: 'i' },
      }).select('_id');

      if (existingUser) {
        return ApiResponse.conflict(res, 'Username is already taken');
      }

      updates.username = normalizedUsername;
    }

    if (firstName !== undefined) {
      updates.firstName = String(firstName).trim().slice(0, 50);
    }

    if (lastName !== undefined) {
      updates.lastName = String(lastName).trim().slice(0, 50);
    }

    if (profileCid !== undefined) updates.profileCid = profileCid;

    if (Object.keys(updates).length === 0) {
      return ApiResponse.badRequest(res, 'No profile fields provided');
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updates,
      { new: true, runValidators: true }
    );

    return ApiResponse.success(res, updatedUser.toPublicJSON(), 'Profile updated');
  } catch (error) {
    logger.error('Update profile error:', error);
    if (error?.code === 11000 && error?.keyPattern?.username) {
      return ApiResponse.conflict(res, 'Username is already taken');
    }
    return ApiResponse.error(res, error.message);
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'xp', limit = 10 } = req.query;
    
    let users;
    if (type === 'wins') {
      users = await User.find({ isBanned: false })
        .sort({ wins: -1 })
        .limit(parseInt(limit))
        .select('username imageUrl xp wins badges');
    } else {
      users = await User.find({ isBanned: false })
        .sort({ xp: -1 })
        .limit(parseInt(limit))
        .select('username imageUrl xp wins badges');
    }

    return ApiResponse.success(res, users);
  } catch (error) {
    logger.error('Leaderboard error:', error);
    return ApiResponse.error(res, error.message);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }

    return ApiResponse.success(res, user.toPublicJSON());
  } catch (error) {
    logger.error('Get user error:', error);
    return ApiResponse.error(res, error.message);
  }
};
