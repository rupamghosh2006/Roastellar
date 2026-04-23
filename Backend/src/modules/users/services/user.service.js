const User = require('../users/models/user.model');
const { BADGES, XP_REWARD_WIN, XP_REWARD_LOSE, RANK_POINTS_WIN, RANK_POINTS_LOSE } = require('../../utils/constants');

class UserService {
  async updateProfile(userId, updates) {
    const allowedUpdates = ['name', 'avatar', 'profileCid'];
    const filteredUpdates = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key) && value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    return user.toPublicJSON();
  }

  async getLeaderboard(limit = 10) {
    return User.find({ isBanned: false, walletPublicKey: { $exists: true } })
      .sort({ xp: -1 })
      .limit(limit)
      .select('name avatar xp wins rankPoints badges')
      .lean();
  }

  async getTopWins(limit = 10) {
    return User.find({ isBanned: false, walletPublicKey: { $exists: true } })
      .sort({ wins: -1 })
      .limit(limit)
      .select('name avatar wins xp')
      .lean();
  }

  async addXP(userId, amount) {
    const user = await User.findById(userId);
    if (!user) return null;
    
    user.xp += amount;
    await user.save();
    return user;
  }

  async addWin(userId) {
    const user = await User.findById(userId);
    if (!user) return null;
    
    user.wins += 1;
    user.xp += XP_REWARD_WIN;
    user.rankPoints += RANK_POINTS_WIN;
    
    await this.checkBadges(user);
    await user.save();
    return user;
  }

  async addLoss(userId) {
    const user = await User.findById(userId);
    if (!user) return null;
    
    user.losses += 1;
    user.xp += XP_REWARD_LOSE;
    user.rankPoints = Math.max(0, user.rankPoints - RANK_POINTS_LOSE);
    
    await user.save();
    return user;
  }

  async checkBadges(user) {
    if (user.wins === 1 && !user.badges.includes(BADGES.FIRST_WIN)) {
      user.badges.push(BADGES.FIRST_WIN);
    }
    if (user.wins >= 5 && !user.badges.includes(BADGES.FIVE_WINS)) {
      user.badges.push(BADGES.FIVE_WINS);
    }
    
    const totalMatches = user.wins + user.losses;
    if (totalMatches >= 10 && !user.badges.includes(BADGES.TEN_MATCHES)) {
      user.badges.push(BADGES.TEN_MATCHES);
    }
  }

  async banUser(userId) {
    return User.findByIdAndUpdate(
      userId,
      { isBanned: true },
      { new: true }
    );
  }

  async unbanUser(userId) {
    return User.findByIdAndUpdate(
      userId,
      { isBanned: false },
      { new: true }
    );
  }

  async getAllUsers(page = 1, limit = 20, search = '') {
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return {
      users: users.map(u => u.toPublicJSON()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(userId) {
    return User.findById(userId);
  }

  async findByWalletPublicKey(publicKey) {
    return User.findOne({ walletPublicKey: publicKey });
  }
}

module.exports = new UserService();