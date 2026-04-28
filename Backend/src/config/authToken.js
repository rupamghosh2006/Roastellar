const jwt = require('jsonwebtoken');

const APP_TOKEN_ISSUER = 'roastellar-wallet-auth';
const APP_TOKEN_AUDIENCE = 'roastellar-app';
const APP_TOKEN_EXPIRY = process.env.APP_AUTH_TOKEN_EXPIRY || '30d';

function getJwtSecret() {
  const secret = process.env.APP_AUTH_JWT_SECRET || process.env.CLERK_SECRET_KEY || '';
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('APP_AUTH_JWT_SECRET is required in production');
  }
  return secret || 'dev-wallet-auth-secret-change-me';
}

function signWalletToken({ userId, walletAddress }) {
  return jwt.sign(
    {
      sub: String(userId),
      walletAddress: String(walletAddress),
      typ: 'wallet',
    },
    getJwtSecret(),
    {
      issuer: APP_TOKEN_ISSUER,
      audience: APP_TOKEN_AUDIENCE,
      expiresIn: APP_TOKEN_EXPIRY,
    }
  );
}

function verifyWalletToken(token) {
  try {
    return jwt.verify(token, getJwtSecret(), {
      issuer: APP_TOKEN_ISSUER,
      audience: APP_TOKEN_AUDIENCE,
    });
  } catch (_) {
    return null;
  }
}

module.exports = {
  signWalletToken,
  verifyWalletToken,
};
