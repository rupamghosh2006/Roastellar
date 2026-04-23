require('dotenv').config();
const { Clerk } = require('@clerk/clerk-sdk-node');

const clerkClient = new Clerk({
  secretKey: process.env.CLERK_SECRET_KEY,
});

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
    try {
      const { claims } = await clerkClient.verifyToken(token);
      return claims;
    } catch (error) {
      console.error(`Clerk verifyToken error: ${error.message}`);
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