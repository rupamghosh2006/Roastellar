require('dotenv').config();
const { Clerk, verifyToken, decodeJwt } = require('@clerk/clerk-sdk-node');

const clerkClient = new Clerk({
  secretKey: process.env.CLERK_SECRET_KEY,
});

function canUseDevAuthFallback() {
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_AUTH_FALLBACK === 'true';
}

function normalizeEnvValue(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed;

  return unquoted.replace(/\\n/g, '\n');
}

function getAllowedOrigins() {
  const raw = normalizeEnvValue(
    process.env.CLERK_AUTHORIZED_PARTIES || process.env.CLIENT_URL || process.env.CORS_ORIGIN || ''
  );
  const values = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => value !== '*');

  return values.length > 0 ? values : undefined;
}

function normalizeOrigin(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const url = new URL(trimmed);
    return `${url.protocol}//${url.host}`;
  } catch (error) {
    return trimmed.replace(/\/+$/, '');
  }
}

function getVerifyOptions() {
  const options = {};

  if (process.env.CLERK_SECRET_KEY) {
    options.secretKey = process.env.CLERK_SECRET_KEY;
  }

  if (process.env.CLERK_JWT_KEY) {
    options.jwtKey = normalizeEnvValue(process.env.CLERK_JWT_KEY);
  }

  const clockSkewMs = Number(process.env.CLERK_TOKEN_CLOCK_SKEW_MS || 15000);
  if (Number.isFinite(clockSkewMs) && clockSkewMs >= 0) {
    options.clockSkewInMs = clockSkewMs;
  }

  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins?.length) {
    options.authorizedParties = allowedOrigins;
  }

  return options;
}

function validateAuthorizedParty(claims, requestContext = {}) {
  const allowedOrigins = (getAllowedOrigins() || []).map(normalizeOrigin);
  if (allowedOrigins.length === 0) {
    return { valid: true };
  }

  const tokenAzp = normalizeOrigin(claims?.azp);
  if (!tokenAzp) {
    return { valid: true };
  }

  if (!allowedOrigins.includes(tokenAzp)) {
    return {
      valid: false,
      reason: 'Token azp is not in allowed origins',
      details: {
        tokenAzp,
        allowedOrigins,
      },
    };
  }

  const requestOrigin = normalizeOrigin(
    requestContext.origin ||
    requestContext.referer ||
    requestContext.host
  );

  if (requestOrigin && requestOrigin !== tokenAzp) {
    return {
      valid: false,
      reason: 'Request origin does not match token azp',
      details: {
        requestOrigin,
        tokenAzp,
        allowedOrigins,
      },
    };
  }

  return { valid: true };
}

const clerk = {
  client: clerkClient,
  
  async getUser(userId) {
    try {
      return await clerkClient.users.getUser(userId);
    } catch (error) {
      console.error(`Clerk getUser error: ${error.message}`);
      return null;
    }
  },

  async getUserByEmail(email) {
    try {
      const response = await clerkClient.users.getUserList({ emailAddress: [email] });
      return response.data[0] || null;
    } catch (error) {
      console.error(`Clerk getUserByEmail error: ${error.message}`);
      return null;
    }
  },

  async verifyToken(token, requestContext = {}) {
    if (canUseDevAuthFallback()) {
      try {
        const decoded = decodeJwt(token);
        const payload = decoded?.payload || {};
        const looksLikeClerkSession =
          typeof payload.sub === 'string' &&
          typeof payload.iss === 'string' &&
          (payload.iss.includes('clerk.accounts.dev') || payload.iss.includes('clerk.com'));

        if (looksLikeClerkSession) {
          console.warn('Clerk dev auth fallback: trusting decoded JWT claims');
          return payload;
        }

        console.error('Clerk dev auth fallback rejected token shape', {
          iss: payload.iss,
          sub: payload.sub,
        });
        return null;
      } catch (error) {
        console.error(`Clerk dev auth fallback decode error: ${error.message}`);
        return null;
      }
    }

    try {
      const verified = await verifyToken(token, getVerifyOptions());
      const claims = verified?.claims || null;
      if (!claims) {
        return null;
      }

      const azpValidation = validateAuthorizedParty(claims, requestContext);
      if (!azpValidation.valid) {
        console.error('Clerk azp validation error:', azpValidation.details);
        return null;
      }

      return claims;
    } catch (error) {
      try {
        const decoded = decodeJwt(token);
        const payload = decoded?.payload || {};

        console.error('Clerk verifyToken error:', {
          message: error.message,
          azp: payload.azp,
          aud: payload.aud,
          iss: payload.iss,
          sub: payload.sub,
          allowedOrigins: getAllowedOrigins(),
          usingJwtKey: Boolean(process.env.CLERK_JWT_KEY),
        });
      } catch (decodeError) {
        console.error(`Clerk verifyToken error: ${error.message}`);
      }
      return null;
    }
  },

  async getAuthCount() {
    try {
      const count = await clerkClient.users.getCount();
      return count;
    } catch (error) {
      console.error(`Clerk getAuthCount error: ${error.message}`);
      return 0;
    }
  },
};

module.exports = { clerk, clerkClient };
