const axios = require('axios');
const CryptoJS = require('crypto-js');
const { StellarSdk, server } = require('../../config/stellar');

class WalletService {
  createStellarWallet() {
    const keypair = StellarSdk.Keypair.random();
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }

  encryptSecret(secret) {
    const encryptionKey = process.env.WALLET_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('WALLET_ENCRYPTION_KEY is not configured');
    }

    return CryptoJS.AES.encrypt(secret, encryptionKey).toString();
  }

  decryptSecret(encrypted) {
    const encryptionKey = process.env.WALLET_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('WALLET_ENCRYPTION_KEY is not configured');
    }

    const bytes = CryptoJS.AES.decrypt(encrypted, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async fundWithFriendbot(publicKey) {
    try {
      const response = await axios.get('https://friendbot.stellar.org', {
        params: { addr: publicKey },
        timeout: 15000,
      });

      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || error.message;
      throw new Error(`Friendbot failed: ${message}`);
    }
  }

  async getBalance(publicKey) {
    try {
      const account = await server.loadAccount(publicKey);
      const nativeBalance = account.balances.find((balance) => balance.asset_type === 'native');

      return nativeBalance ? parseFloat(nativeBalance.balance) : 0;
    } catch (error) {
      if (error?.response?.status === 404 || error?.status === 404) {
        return 0;
      }

      throw new Error(`Balance fetch failed: ${error.message}`);
    }
  }
}

module.exports = new WalletService();
