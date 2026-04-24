const User = require('../../users/models/user.model');
const ApiResponse = require('../../../utils/apiResponse');
const logger = require('../../../utils/logger');

exports.getLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 100);
    const users = await User.find({ isBanned: false })
      .sort({ rankPoints: -1, xp: -1, wins: -1 })
      .limit(limit)
      .select('username imageUrl avatar clerkId xp wins losses rankPoints badges totalBattles createdAt');

    const leaderboard = users.map((user, index) => {
      const total = Number(user.wins || 0) + Number(user.losses || 0);
      return {
        ...user.toPublicJSON(),
        rank: index + 1,
        winRate: total > 0 ? (Number(user.wins || 0) / total) * 100 : 0,
      };
    });

    return ApiResponse.success(res, leaderboard);
  } catch (error) {
    logger.error('Leaderboard fetch error', { message: error?.message });
    return ApiResponse.error(res, error.message || 'Failed to fetch leaderboard');
  }
};
