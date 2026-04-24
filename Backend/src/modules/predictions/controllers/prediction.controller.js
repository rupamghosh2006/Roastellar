const predictionService = require('../services/prediction.service');
const ApiResponse = require('../../../utils/apiResponse');
const logger = require('../../../utils/logger');

function parseMatchId(raw) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Invalid matchId');
  }
  return parsed;
}

exports.place = async (req, res) => {
  try {
    const matchId = parseMatchId(req.params.matchId);
    const prediction = await predictionService.place({
      user: req.auth.user,
      matchId,
      selectedPlayer: req.body?.selectedPlayer,
      amount: req.body?.amount,
    });
    return ApiResponse.created(res, prediction, 'Prediction placed');
  } catch (error) {
    logger.error('Prediction place error', { message: error?.message });
    return ApiResponse.badRequest(res, error.message || 'Failed to place prediction');
  }
};

exports.getMatchPredictions = async (req, res) => {
  try {
    const matchId = parseMatchId(req.params.matchId);
    const [summary, predictions] = await Promise.all([
      predictionService.getSummary(matchId),
      predictionService.getAllForMatch(matchId),
    ]);

    return ApiResponse.success(res, {
      summary,
      predictions,
    });
  } catch (error) {
    logger.error('Prediction summary error', { message: error?.message });
    if (error.message === 'Battle not found') {
      return ApiResponse.notFound(res, 'Battle not found');
    }
    return ApiResponse.error(res, error.message || 'Failed to fetch predictions');
  }
};
