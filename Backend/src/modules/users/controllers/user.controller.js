const User = require('../models/user.model');
const ApiResponse = require('../../../utils/apiResponse');
const logger = require('../../../utils/logger');

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
    const { username, profileCid } = req.body;
    const user = req.auth.user;

    const updates = {};
    if (username) updates.username = username;
    if (profileCid !== undefined) updates.profileCid = profileCid;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updates,
      { new: true, runValidators: true }
    );

    return ApiResponse.success(res, updatedUser.toPublicJSON(), 'Profile updated');
  } catch (error) {
    logger.error('Update profile error:', error);
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