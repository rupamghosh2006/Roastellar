const User = require('../../users/models/user.model');
const ApiResponse = require('../../../utils/apiResponse');
const logger = require('../../../utils/logger');

exports.getLeaderboard = async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(Math.floor(requestedLimit), 1000)
      : null;

    let query = User.find({ isBanned: false })
      .sort({ rankPoints: -1, xp: -1, wins: -1 })
      .select('username imageUrl avatar clerkId xp wins losses rankPoints badges totalBattles createdAt');

    if (limit) {
      query = query.limit(limit);
    }

    const users = await query;

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
