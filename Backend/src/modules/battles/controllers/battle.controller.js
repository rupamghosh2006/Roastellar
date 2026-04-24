const battleService = require('../services/battle.service');
const ApiResponse = require('../../../utils/apiResponse');
const logger = require('../../../utils/logger');

function parseMatchId(raw) {
  const matchId = Number(raw);
  if (!Number.isFinite(matchId) || matchId <= 0) {
    throw new Error('Invalid matchId');
  }
  return matchId;
}

exports.create = async (req, res) => {
  try {
    const { topic, entryFee } = req.body || {};
    const battle = await battleService.createBattle({
      user: req.auth.user,
      topic,
      entryFee,
    });
    return ApiResponse.created(res, battle, 'Battle created');
  } catch (error) {
    logger.error('Create battle error', { message: error?.message });
    return ApiResponse.badRequest(res, error.message || 'Failed to create battle');
  }
};

exports.join = async (req, res) => {
  try {
    const matchId = parseMatchId(req.params.matchId);
    const battle = await battleService.joinBattle({
      user: req.auth.user,
      matchId,
    });
    return ApiResponse.success(res, battle, 'Joined battle');
  } catch (error) {
    logger.error('Join battle error', { message: error?.message });
    return ApiResponse.badRequest(res, error.message || 'Failed to join battle');
  }
};

exports.getOpenMatches = async (req, res) => {
  try {
    const battles = await battleService.getOpenBattles();
    return ApiResponse.success(res, battles);
  } catch (error) {
    logger.error('Get open battles error', { message: error?.message });
    return ApiResponse.error(res, error.message || 'Failed to fetch open battles');
  }
};

exports.getMatch = async (req, res) => {
  try {
    const matchId = parseMatchId(req.params.matchId);
    const battle = await battleService.getBattleByMatchId(matchId);
    return ApiResponse.success(res, battle);
  } catch (error) {
    logger.error('Get battle error', { message: error?.message });
    if (error.message === 'Battle not found') {
      return ApiResponse.notFound(res, 'Battle not found');
    }
    return ApiResponse.error(res, error.message || 'Failed to fetch battle');
  }
};

exports.submitRoast = async (req, res) => {
  try {
    const matchId = parseMatchId(req.params.matchId);
    const text = req.body?.text || req.body?.roast || '';
    const battle = await battleService.submitRoast({
      user: req.auth.user,
      matchId,
      text,
    });
    return ApiResponse.success(res, battle, 'Roast submitted');
  } catch (error) {
    logger.error('Submit roast error', { message: error?.message });
    return ApiResponse.badRequest(res, error.message || 'Failed to submit roast');
  }
};

exports.vote = async (req, res) => {
  try {
    const matchId = parseMatchId(req.params.matchId);
    const selectedPlayer = req.body?.selectedPlayer || req.body?.playerId;
    const battle = await battleService.castVote({
      user: req.auth.user,
      matchId,
      selectedPlayer,
    });
    return ApiResponse.success(res, battle, 'Vote recorded');
  } catch (error) {
    logger.error('Vote error', { message: error?.message });
    return ApiResponse.badRequest(res, error.message || 'Failed to cast vote');
  }
};

exports.finalize = async (req, res) => {
  try {
    const matchId = parseMatchId(req.params.matchId);
    const battle = await battleService.finalizeBattle({
      matchId,
      actorUserId: req.auth?.user?._id || null,
    });
    return ApiResponse.success(res, battle, 'Battle finalized');
  } catch (error) {
    logger.error('Finalize error', { message: error?.message });
    return ApiResponse.badRequest(res, error.message || 'Failed to finalize battle');
  }
};

exports.cancel = async (req, res) => {
  try {
    const matchId = parseMatchId(req.params.matchId);
    const battle = await battleService.cancelBattle({
      user: req.auth.user,
      matchId,
    });
    return ApiResponse.success(res, battle, 'Battle cancelled');
  } catch (error) {
    logger.error('Cancel battle error', { message: error?.message });
    return ApiResponse.badRequest(res, error.message || 'Failed to cancel battle');
  }
};
