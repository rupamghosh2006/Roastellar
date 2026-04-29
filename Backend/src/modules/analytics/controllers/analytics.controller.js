const ApiResponse = require('../../../utils/apiResponse');
const logger = require('../../../utils/logger');
const analyticsService = require('../services/analytics.service');

exports.getPublicMetrics = async (req, res) => {
  try {
    const metrics = await analyticsService.getPublicMetrics();
    return ApiResponse.success(res, metrics);
  } catch (error) {
    logger.error('Get public metrics error:', error);
    return ApiResponse.error(res, error.message);
  }
};
