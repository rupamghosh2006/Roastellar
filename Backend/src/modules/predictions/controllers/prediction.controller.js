const { predictionService, uploadService } = require('../services/prediction.service');
const ApiResponse = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

exports.place = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { selectedPlayer, amount } = req.body;
    const prediction = await predictionService.place(
      req.user.id,
      parseInt(matchId),
      selectedPlayer,
      amount
    );
    return ApiResponse.created(res, prediction, 'Prediction placed');
  } catch (error) {
    logger.error('Place prediction error:', error);
    return ApiResponse.badRequest(res, error.message);
  }
};

exports.getMatchPredictions = async (req, res) => {
  try {
    const { matchId } = req.params;
    const predictions = await predictionService.getPredictionsForMatch(parseInt(matchId));
    return ApiResponse.success(res, predictions);
  } catch (error) {
    logger.error('Get predictions error:', error);
    return ApiResponse.error(res, error.message);
  }
};

exports.myPredictions = async (req, res) => {
  try {
    const predictions = await predictionService.getUserPredictions(req.user.id);
    return ApiResponse.success(res, predictions);
  } catch (error) {
    logger.error('My predictions error:', error);
    return ApiResponse.error(res, error.message);
  }
};

exports.upload = async (req, res) => {
  try {
    const { data, name } = req.body;
    if (!data) {
      return ApiResponse.badRequest(res, 'Data is required');
    }
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    const cid = await uploadService.uploadJSON(parsedData, name || 'upload');
    return ApiResponse.success(res, { cid }, 'Uploaded to IPFS');
  } catch (error) {
    logger.error('Upload error:', error);
    return ApiResponse.badRequest(res, error.message);
  }
};