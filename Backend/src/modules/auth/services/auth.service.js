const User = require('../users/models/user.model');
const { verifyGoogleToken } = require('../../config/firebase');
const stellarService = require('../battles/services/stellar.service');
const { EVENT_TYPES } = require('../../utils/constants');
const Analytics = require('../analytics/models/analytics.model');
const logger = require('../../utils/logger');

class AuthService {
  async login(idToken) {
    const decodedToken = await verifyGoogleToken(idToken);
    
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    const isNewUser = !user;

    if (!user) {
      user = await this.createUserFromFirebase(decodedToken);
    }

    user.lastLoginAt = new Date();
    await user.save();

    await Analytics.create({
      userId: user._id,
      eventType: EVENT_TYPES.LOGIN,
      metadata: { email: user.email },
    });

    return {
      user: user.toPublicJSON(),
      isNewUser,
    };
  }

  async createUserFromFirebase(decodedToken) {
    const { name, email, picture } = decodedToken;
    
    const { publicKey, secret } = await stellarService.createWallet();
    const encryptedSecret = stellarService.encryptSecret(secret);

    const user = new User({
      firebaseUid: decodedToken.uid,
      name: name || 'Anonymous',
      email: email || `${decodedToken.uid}@firebase`,
      avatar: picture || '',
      walletPublicKey: publicKey,
      walletEncryptedSecret: encryptedSecret,
    });

    await user.save();

    try {
      await stellarService.fundWithFriendbot(publicKey);
      await Analytics.create({
        userId: user._id,
        eventType: EVENT_TYPES.WALLET_CREATED,
        metadata: { publicKey },
      });
    } catch (error) {
      logger.warn(`Failed to fund wallet: ${error.message}`);
    }

    return user;
  }

  async getUserById(userId) {
    return User.findById(userId);
  }

  async getUserByFirebaseUid(firebaseUid) {
    return User.findOne({ firebaseUid });
  }

  async getUserByWalletPublicKey(publicKey) {
    return User.findOne({ walletPublicKey: publicKey });
  }
}

module.exports = new AuthService();