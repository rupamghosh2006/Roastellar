const User = require('../users/models/user.model');
const ApiResponse = require('../../utils/apiResponse');
const walletService = require('./wallet.service');
const logger = require('../../utils/logger');

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

    user.walletPublicKey = publicKey;
    user.walletEncryptedSecret = encryptedSecret;
    user.walletCreatedAt = new Date();
    user.walletFunded = false;
    user.onboardingCompleted = true;
    await user.save();

    let balance = 0;
    let fundingPending = false;
    try {
      await walletService.fundWithFriendbot(publicKey);
      user.walletFunded = true;
      await user.save();
      balance = await walletService.getBalance(publicKey);
    } catch (fundingError) {
      fundingPending = true;
      logger.warn('Wallet created but Friendbot funding is pending', {
        clerkId,
        publicKey,
        message: fundingError?.message,
      });
      balance = await walletService.getBalance(publicKey);
    }

    return ApiResponse.created(res, {
      alreadyExists: false,
      fundingPending,
      wallet: walletPayload(user, balance),
    }, fundingPending ? 'Wallet created. Funding is pending, retry shortly.' : 'Wallet created');
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

exports.exportWalletSecret = async (req, res, next) => {
  try {
    const clerkId = req.auth?.user?.clerkId || req.auth?.claims?.sub;

    if (!clerkId) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    if (String(process.env.STELLAR_NETWORK || 'testnet').toLowerCase() === 'mainnet') {
      return ApiResponse.forbidden(res, 'Wallet secret export is disabled on mainnet');
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }

    if (!user.walletPublicKey || !user.walletEncryptedSecret) {
      return ApiResponse.notFound(res, 'Wallet not created yet');
    }

    const secretKey = walletService.decryptSecret(user.walletEncryptedSecret);
    if (!secretKey) {
      return ApiResponse.error(res, 'Unable to decrypt wallet secret');
    }

    logger.warn('Wallet secret exported for Freighter import', {
      clerkId,
      publicKey: user.walletPublicKey,
    });

    return ApiResponse.success(res, {
      publicKey: user.walletPublicKey,
      secretKey,
      network: String(process.env.STELLAR_NETWORK || 'testnet').toUpperCase(),
    }, 'Wallet secret exported');
  } catch (error) {
    next(error);
  }
};
