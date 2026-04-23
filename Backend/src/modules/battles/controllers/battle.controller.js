const Battle = require('../models/battle.model');
const User = require('../../users/models/user.model');
const ApiResponse = require('../../../utils/apiResponse');
const logger = require('../../../utils/logger');

exports.create = async (req, res) => {
  try {
    const { topic, topicCid, entryFee } = req.body;
    const user = req.auth.user;

    const lastBattle = await Battle.findOne().sort({ matchId: -1 });
    const matchId = lastBattle ? lastBattle.matchId + 1 : 1;

    const battle = new Battle({
      matchId,
      creator: user._id,
      player1: user._id,
      topic: topic || 'Roast Battle',
      topicCid: topicCid || '',
      entryFee: entryFee || 1000,
      status: 'open',
    });

    await battle.save();

    return ApiResponse.created(res, battle.toJSON(), 'Battle created');
  } catch (error) {
    logger.error('Create battle error:', error);
    return ApiResponse.error(res, error.message);
  }
};

exports.join = async (req, res) => {
  try {
    const { matchId } = req.params;
    const user = req.auth.user;

    const battle = await Battle.findOne({ matchId: parseInt(matchId) });
    if (!battle) {
      return ApiResponse.notFound(res, 'Match not found');
    }

    if (battle.status !== 'open') {
      return ApiResponse.badRequest(res, 'Match is not open');
    }

    if (battle.player1.toString() === user._id.toString()) {
      return ApiResponse.badRequest(res, 'Cannot join your own match');
    }

    battle.player2 = user._id;
    battle.status = 'active';
    battle.startedAt = new Date();
    await battle.save();

    return ApiResponse.success(res, battle.toJSON(), 'Joined battle');
  } catch (error) {
    logger.error('Join battle error:', error);
    return ApiResponse.error(res, error.message);
  }
};

exports.submitRoast = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { roastCid } = req.body;
    const user = req.auth.user;

    const battle = await Battle.findOne({ matchId: parseInt(matchId) });
    if (!battle) {
      return ApiResponse.notFound(res, 'Match not found');
    }

    const isPlayer1 = battle.player1.toString() === user._id.toString();
    const isPlayer2 = battle.player2?.toString() === user._id.toString();

    if (!isPlayer1 && !isPlayer2) {
      return ApiResponse.forbidden(res, 'Only players can submit roasts');
    }

    if (isPlayer1) {
      battle.roast1Cid = roastCid;
    } else {
      battle.roast2Cid = roastCid;
    }

    await battle.save();

    return ApiResponse.success(res, battle.toJSON(), 'Roast submitted');
  } catch (error) {
    logger.error('Submit roast error:', error);
    return ApiResponse.error(res, error.message);
  }
};

exports.vote = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { selectedPlayer } = req.body;
    const user = req.auth.user;

    const battle = await Battle.findOne({ matchId: parseInt(matchId) });
    if (!battle) {
      return ApiResponse.notFound(res, 'Match not found');
    }

    if (battle.status !== 'active') {
      return ApiResponse.badRequest(res, 'Match is not active');
    }

    const player1Id = battle.player1.toString();
    const player2Id = battle.player2?.toString();

    if (selectedPlayer === player1Id) {
      battle.votesPlayer1 += 1;
    } else if (selectedPlayer === player2Id) {
      battle.votesPlayer2 += 1;
    } else {
      return ApiResponse.badRequest(res, 'Invalid player selection');
    }

    await battle.save();

    return ApiResponse.success(res, battle.toJSON(), 'Vote recorded');
  } catch (error) {
    logger.error('Vote error:', error);
    return ApiResponse.error(res, error.message);
  }
};

exports.finalize = async (req, res) => {
  try {
    const { matchId } = req.params;

    const battle = await Battle.findOne({ matchId: parseInt(matchId) });
    if (!battle) {
      return ApiResponse.notFound(res, 'Match not found');
    }

    if (battle.status === 'ended' || battle.status === 'draw') {
      return ApiResponse.badRequest(res, 'Match already finalized');
    }

    const votes1 = battle.votesPlayer1;
    const votes2 = battle.votesPlayer2;

    if (votes1 === votes2) {
      battle.status = 'draw';
    } else if (votes1 > votes2) {
      battle.winner = battle.player1;
      battle.status = 'ended';
    } else {
      battle.winner = battle.player2;
      battle.status = 'ended';
    }

    battle.endedAt = new Date();
    await battle.save();

    return ApiResponse.success(res, battle.toJSON(), 'Battle finalized');
  } catch (error) {
    logger.error('Finalize error:', error);
    return ApiResponse.error(res, error.message);
  }
};

exports.getMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    const battle = await Battle.findOne({ matchId: parseInt(matchId) })
      .populate('player1', 'username imageUrl')
      .populate('player2', 'username imageUrl')
      .populate('creator', 'username imageUrl')
      .populate('winner', 'username imageUrl');

    if (!battle) {
      return ApiResponse.notFound(res, 'Match not found');
    }

    return ApiResponse.success(res, battle.toJSON());
  } catch (error) {
    logger.error('Get match error:', error);
    return ApiResponse.error(res, error.message);
  }
};

exports.getOpenMatches = async (req, res) => {
  try {
    const battles = await Battle.find({ status: 'open' })
      .populate('player1', 'username imageUrl')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return ApiResponse.success(res, battles);
  } catch (error) {
    logger.error('Get open matches error:', error);
    return ApiResponse.error(res, error.message);
  }
};