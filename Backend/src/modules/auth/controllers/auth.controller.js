const authService = require('../modules/auth/services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

exports.login = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return ApiResponse.badRequest(res, 'ID token is required');
    }

    const result = await authService.login(idToken);
    return ApiResponse.success(res, result, 'Login successful');
  } catch (error) {
    logger.error('Login error:', error);
    return ApiResponse.unauthorized(res, error.message);
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }
    return ApiResponse.success(res, user.toPublicJSON());
  } catch (error) {
    logger.error('Get me error:', error);
    return ApiResponse.error(res, error.message);
  }
};