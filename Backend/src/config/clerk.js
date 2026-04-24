require('dotenv').config();
const { Clerk, verifyToken, decodeJwt } = require('@clerk/clerk-sdk-node');

const clerkClient = new Clerk({
  secretKey: process.env.CLERK_SECRET_KEY,
});

function canUseDevAuthFallback() {
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_AUTH_FALLBACK === 'true';
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

  async verifyToken(token) {
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
      const verified = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      return verified?.claims || null;
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
