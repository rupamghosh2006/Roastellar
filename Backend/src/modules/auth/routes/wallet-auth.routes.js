const crypto = require('crypto');
const express = require('express');
const User = require('../../users/models/user.model');
const ApiResponse = require('../../../utils/apiResponse');
const logger = require('../../../utils/logger');
const { StellarSdk } = require('../../../config/stellar');
const { signWalletToken } = require('../../../config/authToken');
const { sanitizeText, sanitizeUsername, sanitizeWalletAddress } = require('../../../utils/inputSanitizer');

const router = express.Router();
const NONCE_TTL_MS = Number(process.env.WALLET_AUTH_NONCE_TTL_MS || 5 * 60 * 1000);
const SIGN_MESSAGE_PREFIX = 'Stellar Signed Message:\n';

function buildChallenge({ walletAddress, nonce }) {
  return [
    'Roastellar Wallet Login',
    `Address: ${walletAddress}`,
    `Nonce: ${nonce}`,
    'Sign this message to prove wallet ownership.',
  ].join('\n');
}

function parseSignedMessageCandidates(value) {
  const candidates = [];
  if (!value) return candidates;

  const pushUnique = (buf) => {
    if (!Buffer.isBuffer(buf) || buf.length === 0) return;
    const exists = candidates.some((item) => item.equals(buf));
    if (!exists) candidates.push(buf);
  };

  if (typeof value === 'object' && value.type === 'Buffer' && Array.isArray(value.data)) {
    pushUnique(Buffer.from(value.data));
    return candidates;
  }

  if (typeof value !== 'string') {
    return candidates;
  }

  const trimmed = value.trim();
  if (!trimmed) return candidates;

  // Base64
  try {
    pushUnique(Buffer.from(trimmed, 'base64'));
  } catch (_) {}

  // Base64url
  try {
    const normalized = trimmed.replace(/-/g, '+').replace(/_/g, '/');
    pushUnique(Buffer.from(normalized, 'base64'));
  } catch (_) {}

  // Hex
  if (/^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length % 2 === 0) {
    try {
      pushUnique(Buffer.from(trimmed, 'hex'));
    } catch (_) {}
  }

  // UTF-8 raw
  pushUnique(Buffer.from(trimmed, 'utf8'));

  return candidates;
}

router.post('/wallet/challenge', async (req, res) => {
  try {
    const walletAddress = sanitizeWalletAddress(req.body?.walletAddress);
    const usernameInput = sanitizeUsername(req.body?.username);

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
    const walletAddress = sanitizeWalletAddress(req.body?.walletAddress);
    const signedMessageRaw = req.body?.signedMessage;
    const signerAddress = sanitizeWalletAddress(req.body?.signerAddress);
    const nonce = sanitizeText(req.body?.nonce, 128);

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
    const signedCandidates = parseSignedMessageCandidates(signedMessageRaw);
    if (signedCandidates.length === 0) {
      return ApiResponse.badRequest(res, 'Invalid signedMessage format');
    }

    const keypair = StellarSdk.Keypair.fromPublicKey(walletAddress);
    const challengeBytes = Buffer.from(challenge, 'utf8');
    const challengeHash = crypto.createHash('sha256').update(challengeBytes).digest();
    const prefixedBytes = Buffer.from(`${SIGN_MESSAGE_PREFIX}${challenge}`, 'utf8');
    const prefixedHash = crypto.createHash('sha256').update(prefixedBytes).digest();

    const normalizedCandidates = signedCandidates.flatMap((candidate) => {
      const values = [candidate];
      // Decorated signatures include 4-byte hint + 64-byte sig.
      if (candidate.length === 68) {
        values.push(candidate.subarray(4));
      }
      return values;
    });

    const isValidSignature = normalizedCandidates.some((candidate) => {
      try {
        return (
          keypair.verify(challengeBytes, candidate) ||
          keypair.verify(challengeHash, candidate) ||
          keypair.verify(prefixedBytes, candidate) ||
          keypair.verify(prefixedHash, candidate)
        );
      } catch (_) {
        return false;
      }
    });

    if (!isValidSignature) {
      logger.warn('Wallet signature verification failed', {
        walletAddress,
        signerAddress,
        candidateLengths: signedCandidates.map((item) => item.length),
      });
      return ApiResponse.unauthorized(res, 'Invalid wallet signature');
    }

    // Wallet-auth users keep Freighter as identity wallet; managed wallet is optional and never auto-created here.
    user.identityWalletAddress = walletAddress;
    user.walletPublicKey = user.walletPublicKey || walletAddress;

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
