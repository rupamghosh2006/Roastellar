const Analytics = require('../models/analytics.model');
const User = require('../../modules/users/models/user.model');
const { Battle } = require('../../modules/battles/models/battle.model');
const ApiResponse = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

exports.getMetrics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      dailyActiveUsers,
      totalBattles,
      activeBattles,
      votesToday,
      predictionsToday,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLoginAt: { $gte: today } }),
      Battle.countDocuments(),
      Battle.countDocuments({ status: 'active' }),
      Analytics.countDocuments({
        eventType: 'vote_cast',
        timestamp: { $gte: today },
      }),
      Analytics.countDocuments({
        eventType: 'prediction_placed',
        timestamp: { $gte: today },
      }),
    ]);

    return ApiResponse.success(res, {
      totalUsers,
      dailyActiveUsers,
      totalBattles,
      activeBattles,
      votesToday,
      predictionsToday,
    });
  } catch (error) {
    logger.error('Get metrics error:', error);
    return ApiResponse.error(res, error.message);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await UserService.getAllUsers(parseInt(page), parseInt(limit), search);
    return ApiResponse.success(res, result);
  } catch (error) {
    logger.error('Get all users error:', error);
    return ApiResponse.error(res, error.message);
  }
};

exports.getAllBattles = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = null } = req.query;
    const { battles } = await BattleService.getAllBattles(
      parseInt(page),
      parseInt(limit),
      status
    );
    return ApiResponse.success(res, battles);
  } catch (error) {
    logger.error('Get all battles error:', error);
    return ApiResponse.error(res, error.message);
  }
};

exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await UserService.banUser(userId);
    return ApiResponse.success(res, null, 'User banned');
  } catch (error) {
    logger.error('Ban user error:', error);
    return ApiResponse.error(res, error.message);
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await UserService.unbanUser(userId);
    return ApiResponse.success(res, null, 'User unbanned');
  } catch (error) {
    logger.error('Unban user error:', error);
    return ApiResponse.error(res, error.message);
  }
};

const UserService = require('../../modules/users/services/user.service');
const BattleService = require('../../modules/battles/services/battle.service');