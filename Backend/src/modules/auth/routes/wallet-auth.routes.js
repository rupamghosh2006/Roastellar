const crypto = require('crypto');
const express = require('express');
const User = require('../../users/models/user.model');
const ApiResponse = require('../../../utils/apiResponse');
const logger = require('../../../utils/logger');
const { StellarSdk } = require('../../../config/stellar');
const { signWalletToken } = require('../../../config/authToken');
const walletService = require('../../wallet/wallet.service');

const router = express.Router();
const NONCE_TTL_MS = Number(process.env.WALLET_AUTH_NONCE_TTL_MS || 5 * 60 * 1000);

function buildChallenge({ walletAddress, nonce }) {
  return [
    'Roastellar Wallet Login',
    `Address: ${walletAddress}`,
    `Nonce: ${nonce}`,
    'Sign this message to prove wallet ownership.',
  ].join('\n');
}

function parseSignedMessage(value) {
  if (!value) return null;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    try {
      return Buffer.from(trimmed, 'base64');
    } catch (_) {}

    if (/^[0-9a-fA-F]+$/.test(trimmed)) {
      try {
        return Buffer.from(trimmed, 'hex');
      } catch (_) {}
    }

    return Buffer.from(trimmed, 'utf8');
  }

  if (typeof value === 'object' && value.type === 'Buffer' && Array.isArray(value.data)) {
    return Buffer.from(value.data);
  }

  return null;
}

router.post('/wallet/challenge', async (req, res) => {
  try {
    const walletAddress = String(req.body?.walletAddress || '').trim();
    const usernameInput = String(req.body?.username || '').trim();

    if (!walletAddress) {
      return ApiResponse.badRequest(res, 'walletAddress is required');
    }

    if (!StellarSdk?.StrKey?.isValidEd25519PublicKey?.(walletAddress)) {
      return ApiResponse.badRequest(res, 'Invalid Stellar public key');
    }

    const pseudoClerkId = `wallet:${walletAddress}`;
    const fallbackName = `wallet_${walletAddress.slice(0, 8)}`;
    const username = usernameInput || fallbackName;
    const fallbackEmail = `${walletAddress.toLowerCase()}@wallet.roastellar.local`;

    let user = await User.findOne({ clerkId: pseudoClerkId });
    if (!user) {
      user = await User.create({
        clerkId: pseudoClerkId,
        username,
        name: username,
        email: fallbackEmail,
        firstName: '',
        lastName: '',
        identityWalletAddress: walletAddress,
        walletPublicKey: walletAddress,
        onboardingCompleted: true,
      });
    } else {
      user.walletPublicKey = user.walletPublicKey || walletAddress;
      user.username = user.username || username;
      user.name = user.name || user.username || username;
      user.email = user.email || fallbackEmail;
      user.identityWalletAddress = user.identityWalletAddress || walletAddress;
      user.onboardingCompleted = true;
    }

    const nonce = crypto.randomBytes(16).toString('hex');
    const nonceExpiresAt = new Date(Date.now() + NONCE_TTL_MS);
    user.walletAuthNonce = nonce;
    user.walletAuthNonceExpiresAt = nonceExpiresAt;
    await user.save();

    const challenge = buildChallenge({ walletAddress, nonce });

    return ApiResponse.success(res, {
      walletAddress,
      challenge,
      nonce,
      expiresAt: nonceExpiresAt.toISOString(),
    });
  } catch (error) {
    logger.error('wallet challenge failed', { message: error?.message });
    return ApiResponse.error(res, 'Wallet challenge failed');
  }
});

router.post('/wallet/verify', async (req, res) => {
  try {
    const walletAddress = String(req.body?.walletAddress || '').trim();
    const signedMessageRaw = req.body?.signedMessage;
    const signerAddress = String(req.body?.signerAddress || '').trim();
    const nonce = String(req.body?.nonce || '').trim();

    if (!walletAddress || !nonce || !signedMessageRaw) {
      return ApiResponse.badRequest(res, 'walletAddress, nonce, and signedMessage are required');
    }
    if (signerAddress && signerAddress !== walletAddress) {
      return ApiResponse.unauthorized(res, 'Signer address mismatch');
    }
    if (!StellarSdk?.StrKey?.isValidEd25519PublicKey?.(walletAddress)) {
      return ApiResponse.badRequest(res, 'Invalid Stellar public key');
    }

    const pseudoClerkId = `wallet:${walletAddress}`;
    const user = await User.findOne({ clerkId: pseudoClerkId });
    if (!user) {
      return ApiResponse.unauthorized(res, 'Wallet challenge user not found');
    }
    if (!user.walletAuthNonce || user.walletAuthNonce !== nonce) {
      return ApiResponse.unauthorized(res, 'Invalid nonce');
    }
    if (!user.walletAuthNonceExpiresAt || user.walletAuthNonceExpiresAt.getTime() < Date.now()) {
      return ApiResponse.unauthorized(res, 'Challenge expired');
    }

    const challenge = buildChallenge({ walletAddress, nonce });
    const signedMessage = parseSignedMessage(signedMessageRaw);
    if (!signedMessage) {
      return ApiResponse.badRequest(res, 'Invalid signedMessage format');
    }

    const keypair = StellarSdk.Keypair.fromPublicKey(walletAddress);
    const isValidSignature = keypair.verify(Buffer.from(challenge, 'utf8'), signedMessage);

    if (!isValidSignature) {
      return ApiResponse.unauthorized(res, 'Invalid wallet signature');
    }

    if (!user.walletEncryptedSecret) {
      const { publicKey, secretKey } = walletService.createStellarWallet();
      user.walletPublicKey = publicKey;
      user.walletEncryptedSecret = walletService.encryptSecret(secretKey);
      user.walletCreatedAt = new Date();
      user.walletFunded = false;
      try {
        await walletService.fundWithFriendbot(publicKey);
        user.walletFunded = true;
      } catch (fundError) {
        logger.warn('Wallet-auth managed wallet funding pending', {
          walletAddress: publicKey,
          message: fundError?.message,
        });
      }
    }

    user.walletAuthNonce = '';
    user.walletAuthNonceExpiresAt = null;
    user.walletAuthLastVerifiedAt = new Date();
    user.lastLoginAt = new Date();
    await user.save();

    const token = signWalletToken({
      userId: user._id,
      walletAddress,
    });

    return ApiResponse.success(res, {
      token,
      user: user.toPublicJSON(),
      authType: 'wallet',
    });
  } catch (error) {
    logger.error('wallet verify failed', { message: error?.message });
    return ApiResponse.unauthorized(res, 'Wallet verification failed');
  }
});

module.exports = router;
