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
    const maxAttempts = Number(process.env.FRIENDBOT_MAX_RETRIES || 3);
    const timeoutMs = Number(process.env.FRIENDBOT_TIMEOUT_MS || 15000);
    const retryDelayMs = Number(process.env.FRIENDBOT_RETRY_DELAY_MS || 1200);

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const response = await axios.get('https://friendbot.stellar.org', {
          params: { addr: publicKey },
          timeout: timeoutMs,
        });

        return response.data;
      } catch (error) {
        const status = error?.response?.status;
        const isTransient =
          !status ||
          status >= 500 ||
          ['ECONNABORTED', 'ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT'].includes(error?.code);

        const isLastAttempt = attempt === maxAttempts;
        if (!isTransient || isLastAttempt) {
          const message = error.response?.data?.detail || error.message;
          const friendbotError = new Error(`Friendbot failed: ${message}`);
          friendbotError.code = 'FRIENDBOT_FAILED';
          throw friendbotError;
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelayMs * attempt));
      }
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
