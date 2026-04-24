const User = require('../users/models/user.model');
const ApiResponse = require('../../utils/apiResponse');
const walletService = require('./wallet.service');

function walletPayload(user, balance = 0) {
  return {
    publicKey: user.walletPublicKey,
    funded: Boolean(user.walletFunded),
    balance,
    createdAt: user.walletCreatedAt,
  };
}

exports.createWallet = async (req, res, next) => {
  try {
    const clerkId = req.auth?.user?.clerkId || req.auth?.claims?.sub;

    if (!clerkId) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    const user = await User.findOne({ clerkId });

    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }

    if (user.walletPublicKey && user.walletEncryptedSecret) {
      const balance = await walletService.getBalance(user.walletPublicKey);
      return ApiResponse.success(res, {
        alreadyExists: true,
        wallet: walletPayload(user, balance),
      });
    }

    const { publicKey, secretKey } = walletService.createStellarWallet();
    const encryptedSecret = walletService.encryptSecret(secretKey);

    await walletService.fundWithFriendbot(publicKey);
    const balance = await walletService.getBalance(publicKey);

    user.walletPublicKey = publicKey;
    user.walletEncryptedSecret = encryptedSecret;
    user.walletCreatedAt = new Date();
    user.walletFunded = true;
    user.onboardingCompleted = true;
    await user.save();

    return ApiResponse.created(res, {
      alreadyExists: false,
      wallet: walletPayload(user, balance),
    }, 'Wallet created');
  } catch (error) {
    next(error);
  }
};

exports.getMyWallet = async (req, res, next) => {
  try {
    const clerkId = req.auth?.user?.clerkId || req.auth?.claims?.sub;

    if (!clerkId) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    const user = await User.findOne({ clerkId });

    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }

    if (!user.walletPublicKey) {
      return ApiResponse.notFound(res, 'Wallet not created yet');
    }

    const balance = await walletService.getBalance(user.walletPublicKey);
    return ApiResponse.success(res, walletPayload(user, balance));
  } catch (error) {
    next(error);
  }
};

exports.refundTestWallet = async (req, res, next) => {
  try {
    const clerkId = req.auth?.user?.clerkId || req.auth?.claims?.sub;

    if (!clerkId) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    const user = await User.findOne({ clerkId });

    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }

    if (!user.walletPublicKey) {
      return ApiResponse.notFound(res, 'Wallet not created yet');
    }

    await walletService.fundWithFriendbot(user.walletPublicKey);
    user.walletFunded = true;
    await user.save();

    const balance = await walletService.getBalance(user.walletPublicKey);
    return ApiResponse.success(res, walletPayload(user, balance), 'Wallet re-funded');
  } catch (error) {
    next(error);
  }
};
