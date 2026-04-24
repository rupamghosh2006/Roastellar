const { StellarSdk, server, NETWORK_PASSPHRASE } = require('../../../config/stellar');
const walletService = require('../../wallet/wallet.service');

const ESCROW_SECRET = process.env.STELLAR_ESCROW_SECRET || process.env.TREASURY_SECRET || '';
const BASE_FEE = String(process.env.STELLAR_TX_FEE || 100);

function formatAmount(amountXlm) {
  const value = Number(amountXlm);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Invalid XLM amount');
  }
  return value.toFixed(7);
}

class BattleEscrowService {
  getEscrowKeypair() {
    if (!ESCROW_SECRET) {
      throw new Error('STELLAR_ESCROW_SECRET (or TREASURY_SECRET) is required for real XLM flow');
    }
    return StellarSdk.Keypair.fromSecret(ESCROW_SECRET);
  }

  getEscrowPublicKey() {
    return this.getEscrowKeypair().publicKey();
  }

  getUserSecret(user) {
    if (!user?.walletEncryptedSecret) {
      throw new Error('User wallet secret is not available');
    }
    return walletService.decryptSecret(user.walletEncryptedSecret);
  }

  async transferFromSecret({ fromSecret, toPublicKey, amountXlm, memo }) {
    const keypair = StellarSdk.Keypair.fromSecret(fromSecret);
    const sourceAccount = await server.loadAccount(keypair.publicKey());

    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: toPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: formatAmount(amountXlm),
      }))
      .setTimeout(60);

    if (memo) {
      tx.addMemo(StellarSdk.Memo.text(String(memo).slice(0, 28)));
    }

    const built = tx.build();
    built.sign(keypair);
    const result = await server.submitTransaction(built);
    return result?.hash || '';
  }

  async transferFromUserToEscrow({ user, amountXlm, memo }) {
    if (!user?.walletPublicKey) {
      throw new Error('User wallet is required');
    }
    const userSecret = this.getUserSecret(user);
    return this.transferFromSecret({
      fromSecret: userSecret,
      toPublicKey: this.getEscrowPublicKey(),
      amountXlm,
      memo,
    });
  }

  async transferFromEscrow({ toPublicKey, amountXlm, memo }) {
    return this.transferFromSecret({
      fromSecret: this.getEscrowKeypair().secret(),
      toPublicKey,
      amountXlm,
      memo,
    });
  }
}

module.exports = new BattleEscrowService();
