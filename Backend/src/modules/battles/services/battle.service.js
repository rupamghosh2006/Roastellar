const axios = require('axios');
const { Battle } = require('../models/battle.model');
const User = require('../../modules/users/models/user.model');
const stellarService = require('./stellar.service');
const Analytics = require('../../modules/analytics/models/analytics.model');
const UserService = require('../../modules/users/services/user.service');
const { EVENT_TYPES, BATTLE_STATUS } = require('../../utils/constants');
const { getIO } = require('../../config/socket');
const logger = require('../../utils/logger');

class BattleService {
  async create(userId, topic, topicCid, entryFee) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const lastBattle = await Battle.findOne().sort({ matchId: -1 });
    const matchId = lastBattle ? lastBattle.matchId + 1 : 1;

    const battle = new Battle({
      matchId,
      creator: userId,
      player1: userId,
      topic: topic || 'Roast Battle',
      topicCid: topicCid || '',
      entryFee,
      status: BATTLE_STATUS.OPEN,
    });

    await battle.save();

    await Analytics.create({
      userId,
      eventType: EVENT_TYPES.BATTLE_CREATED,
      metadata: { matchId, entryFee },
    });

    const io = getIO();
    if (io) {
      io.emit('battle_created', battle.toJSON());
      io.emit('leaderboard_updated', await UserService.getLeaderboard());
    }

    return battle;
  }

  async join(matchId, userId) {
    const battle = await Battle.findOne({ matchId });
    if (!battle) throw new Error('Match not found');

    if (battle.status !== BATTLE_STATUS.OPEN) {
      throw new Error('Match is not open');
    }

    const existingPlayer = battle.player1.toString() === userId.toString();
    if (existingPlayer) {
      throw new Error('Cannot join your own match');
    }

    battle.player2 = userId;
    battle.status = BATTLE_STATUS.ACTIVE;
    battle.startedAt = new Date();
    await battle.save();

    await Analytics.create({
      userId,
      eventType: EVENT_TYPES.BATTLE_JOINED,
      metadata: { matchId },
    });

    const io = getIO();
    if (io) {
      io.to(`match_${matchId}`).emit('match_started', battle.toJSON());
    }

    return battle;
  }

  async submitRoast(matchId, userId, roastCid) {
    const battle = await Battle.findOne({ matchId });
    if (!battle) throw new Error('Match not found');

    const isPlayer1 = battle.player1.toString() === userId.toString();
    const isPlayer2 = battle.player2?.toString() === userId.toString();

    if (!isPlayer1 && !isPlayer2) {
      throw new Error('Only players can submit roasts');
    }

    if (isPlayer1) {
      battle.roast1Cid = roastCid;
    } else {
      battle.roast2Cid = roastCid;
    }

    await battle.save();

    const io = getIO();
    if (io) {
      io.to(`match_${matchId}`).emit('roast_submitted', {
        matchId,
        player: userId,
        roastCid,
      });
    }

    return battle;
  }

  async vote(matchId, userId, selectedPlayer) {
    const battle = await Battle.findOne({ matchId });
    if (!battle) throw new Error('Match not found');

    if (battle.status !== BATTLE_STATUS.ACTIVE) {
      throw new Error('Match is not active');
    }

    const player1Id = battle.player1.toString();
    const player2Id = battle.player2?.toString();

    if (selectedPlayer === player1Id) {
      battle.votesPlayer1 += 1;
    } else if (selectedPlayer === player2Id) {
      battle.votesPlayer2 += 1;
    } else {
      throw new Error('Invalid player selection');
    }

    await battle.save();

    await Analytics.create({
      userId,
      eventType: EVENT_TYPES.VOTE_CAST,
      metadata: { matchId, selectedPlayer },
    });

    const io = getIO();
    if (io) {
      io.to(`match_${matchId}`).emit('new_vote', {
        matchId,
        votesPlayer1: battle.votesPlayer1,
        votesPlayer2: battle.votesPlayer2,
      });
    }

    return battle;
  }

  async finalize(matchId) {
    const battle = await Battle.findOne({ matchId });
    if (!battle) throw new Error('Match not found');

    if (battle.status === BATTLE_STATUS.ENDED || battle.status === BATTLE_STATUS.DRAW) {
      throw new Error('Match already finalized');
    }

    const player1Id = battle.player1;
    const player2Id = battle.player2;
    const votes1 = battle.votesPlayer1;
    const votes2 = battle.votesPlayer2;

    let winner = null;
    let resultStatus = BATTLE_STATUS.ENDED;

    if (votes1 === votes2) {
      resultStatus = BATTLE_STATUS.DRAW;
      battle.status = BATTLE_STATUS.DRAW;
    } else if (votes1 > votes2) {
      winner = player1Id;
      battle.winner = player1Id;
    } else {
      winner = player2Id;
      battle.winner = player2Id;
    }

    battle.status = resultStatus;
    battle.endedAt = new Date();
    await battle.save();

    if (winner) {
      await UserService.addWin(winner);
      const loser = winner.toString() === player1Id.toString() ? player2Id : player1Id;
      await UserService.addLoss(loser);
    }

    await Analytics.create({
      userId: winner,
      eventType: EVENT_TYPES.BATTLE_COMPLETED,
      metadata: { matchId, winner: winner?.toString(), status: resultStatus },
    });

    const io = getIO();
    if (io) {
      io.to(`match_${matchId}`).emit('battle_result', {
        matchId,
        status: resultStatus,
        winner: winner?.toString(),
        votesPlayer1: battle.votesPlayer1,
        votesPlayer2: battle.votesPlayer2,
      });
      io.emit('leaderboard_updated', await UserService.getLeaderboard());
    }

    return battle;
  }

  async getMatch(matchId) {
    const battle = await Battle.findOne({ matchId })
      .populate('player1', 'name avatar')
      .populate('player2', 'name avatar')
      .populate('creator', 'name avatar')
      .populate('winner', 'name avatar');

    if (!battle) throw new Error('Match not found');
    return battle;
  }

  async getOpenMatches(limit = 20) {
    return Battle.find({ status: BATTLE_STATUS.OPEN })
      .populate('player1', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async getActiveMatches(limit = 20) {
    return Battle.find({ status: BATTLE_STATUS.ACTIVE })
      .populate('player1', 'name avatar')
      .populate('player2', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async getAllBattles(page = 1, limit = 20, status = null) {
    const query = {};
    if (status) {
      query.status = status;
    }

    const [battles, total] = await Promise.all([
      Battle.find(query)
        .populate('player1', 'name avatar')
        .populate('player2', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Battle.countDocuments(query),
    ]);

    return {
      battles: battles.map(b => b.toJSON()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new BattleService();