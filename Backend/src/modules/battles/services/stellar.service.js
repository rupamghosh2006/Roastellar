const { StellarSdk, server, rpcServer, CONTRACT_ID, NETWORK_PASSPHRASE } = require('../../config/stellar');
const logger = require('../../utils/logger');

class StellarService {
  createWallet() {
    const keyPair = StellarSdk.Keypair.random();
    return {
      publicKey: keyPair.publicKey(),
      secret: keyPair.secret(),
    };
  }

  encryptSecret(secret) {
    const CryptoJS = require('crypto-js');
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-32-chars-abcdef12';
    return CryptoJS.AES.encrypt(secret, encryptionKey).toString();
  }

  decryptSecret(encryptedSecret) {
    const CryptoJS = require('crypto-js');
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-32-chars-abcdef12';
    const bytes = CryptoJS.AES.decrypt(encryptedSecret, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  getTreasuryKeypair() {
    const secret = process.env.TREASURY_SECRET;
    if (!secret) {
      throw new Error('TREASURY_SECRET not configured');
    }
    return StellarSdk.Keypair.fromSecret(secret);
  }

  async fundWithFriendbot(publicKey) {
    try {
      await server.friendbot(publicKey).call();
      logger.info(`Funded wallet: ${publicKey}`);
      return true;
    } catch (error) {
      logger.warn(`Friendbot failed: ${error.message}`);
      return false;
    }
  }

  async getAccount(publicKey) {
    try {
      return await server.loadAccount(publicKey);
    } catch (error) {
      logger.error(`Failed to load account: ${error.message}`);
      return null;
    }
  }

  async getBalance(publicKey) {
    try {
      const account = await server.loadAccount(publicKey);
      const xlm = account.balances.find(b => b.asset_type === 'native');
      return xlm ? parseFloat(xlm.balance) : 0;
    } catch (error) {
      return 0;
    }
  }

  async transferFunds(toPublicKey, amount, memo = null) {
    try {
      const keypair = this.getTreasuryKeypair();
      const sourceAccount = await server.loadAccount(keypair.publicKey());

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: '1000',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(StellarSdk.Operation.payment({
          destination: toPublicKey,
          asset: StellarSdk.Asset.native(),
          amount: amount.toString(),
        }));

      if (memo) {
        transaction.addMemo(StellarSdk.Memo.text(memo));
      }

      transaction.setTimeout(60);
      const builtTx = transaction.build();
      builtTx.sign(keypair);

      const result = await server.submitTransaction(builtTx);
      logger.info(`Transferred ${amount} XLM to ${toPublicKey}`);
      return result;
    } catch (error) {
      logger.error(`Transfer failed: ${error.message}`);
      throw error;
    }
  }

  async invokeContract(method, args) {
    try {
      const keypair = this.getTreasuryKeypair();
      const sourceAccount = await server.loadAccount(keypair.publicKey());
      
      const contract = new StellarSdk.Contract(CONTRACT_ID);

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: '5000',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .appendOperation(contract.invoke({
          method,
          args,
        }))
        .setTimeout(60)
        .build();

      transaction.sign(keypair);
      const result = await server.submitTransaction(transaction);
      
      logger.info(`Contract invoked: ${method}`);
      return result;
    } catch (error) {
      logger.error(`Contract invoke failed: ${error.message}`);
      throw error;
    }
  }

  async buildTransaction(operations) {
    try {
      const keypair = this.getTreasuryKeypair();
      const sourceAccount = await server.loadAccount(keypair.publicKey());

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: '5000',
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      for (const op of operations) {
        transaction.appendOperation(op);
      }

      transaction.setTimeout(120);
      const builtTx = transaction.build();
      builtTx.sign(keypair);

      return builtTx;
    } catch (error) {
      logger.error(`Build transaction failed: ${error.message}`);
      throw error;
    }
  }

  async submitTransaction(transaction) {
    try {
      return await server.submitTransaction(transaction);
    } catch (error) {
      logger.error(`Submit failed: ${error.message}`);
      throw error;
    }
  }

  async getTransaction(txHash) {
    try {
      return await server.transactions().transaction(txHash).call();
    } catch (error) {
      return null;
    }
  }

  async getTreasuryBalance() {
    try {
      const keypair = this.getTreasuryKeypair();
      return this.getBalance(keypair.publicKey());
    } catch (error) {
      return 0;
    }
  }

  async getUserBalance(publicKey) {
    return this.getBalance(publicKey);
  }

  async airdrop(publicKey, amount = 10000) {
    return this.transferFunds(publicKey, amount, 'airdrop');
  }
}

module.exports = new StellarService();