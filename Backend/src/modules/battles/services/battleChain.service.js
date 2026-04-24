const crypto = require('crypto');
const { StellarSdk, rpcServer, NETWORK_PASSPHRASE } = require('../../../config/stellar');
const logger = require('../../../utils/logger');

const CONTRACT_ID = process.env.STELLAR_CONTRACT_ID || 'CBSSWTY2IX3Y4UAE2S7FT4TX25FS65QFCKR4JYZVMNXIKTKCBF3TF3OJ';
const CHAIN_SOURCE_SECRET = process.env.STELLAR_BATTLE_SECRET || process.env.STELLAR_SOURCE_SECRET || '';
const CHAIN_SOURCE_PUBLIC = process.env.STELLAR_BATTLE_PUBLIC || process.env.STELLAR_SOURCE_PUBLIC || '';

function simulatedTx(prefix) {
  return `sim_${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class BattleChainService {
  get canSubmitOnChain() {
    return Boolean(CHAIN_SOURCE_SECRET);
  }

  async invokeContract(method, args = []) {
    if (!this.canSubmitOnChain) {
      logger.warn('Soroban invoke fallback: STELLAR_BATTLE_SECRET/STELLAR_SOURCE_SECRET is missing');
      return simulatedTx(method);
    }

    const keypair = StellarSdk.Keypair.fromSecret(CHAIN_SOURCE_SECRET);
    const sourcePublic = CHAIN_SOURCE_PUBLIC || keypair.publicKey();
    const account = await rpcServer.getAccount(sourcePublic);

    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: String(StellarSdk.BASE_FEE || 100),
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(60)
      .build();

    const simulated = await rpcServer.simulateTransaction(tx);
    if (simulated?.error) {
      throw new Error(`Soroban simulate failed: ${simulated.error}`);
    }

    const prepared = StellarSdk.assembleTransaction(tx, simulated, NETWORK_PASSPHRASE);
    prepared.sign(keypair);

    const sent = await rpcServer.sendTransaction(prepared);
    if (sent.status === 'ERROR') {
      throw new Error(`Soroban send failed: ${sent.errorResultXdr || 'unknown error'}`);
    }

    const hash = sent.hash;
    const maxAttempts = Number(process.env.STELLAR_TX_POLL_ATTEMPTS || 20);
    const pollIntervalMs = Number(process.env.STELLAR_TX_POLL_INTERVAL_MS || 1500);

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const txResult = await rpcServer.getTransaction(hash);
      if (txResult?.status === 'SUCCESS') {
        return hash;
      }
      if (txResult?.status === 'FAILED') {
        throw new Error(`Soroban tx failed: ${hash}`);
      }
      await sleep(pollIntervalMs);
    }

    return hash;
  }

  async createMatchOnChain({ matchId, player1Wallet, topicCid, entryFee }) {
    try {
      logger.info('createMatchOnChain', {
        contractId: CONTRACT_ID,
        matchId,
        player1Wallet,
        topicCid,
        entryFee,
      });

      const args = [
        StellarSdk.nativeToScVal(matchId, { type: 'u32' }),
        StellarSdk.nativeToScVal(player1Wallet || '', { type: 'string' }),
        StellarSdk.nativeToScVal(topicCid || '', { type: 'string' }),
        StellarSdk.nativeToScVal(Number(entryFee || 0), { type: 'i128' }),
      ];
      return this.invokeContract(process.env.STELLAR_CREATE_MATCH_FN || 'create_match', args);
    } catch (error) {
      logger.error('createMatchOnChain failed', { message: error?.message, matchId });
      throw error;
    }
  }

  async finalizeMatchOnChain({ matchId, winnerWallet, votesPlayer1, votesPlayer2 }) {
    try {
      logger.info('finalizeMatchOnChain', {
        contractId: CONTRACT_ID,
        matchId,
        winnerWallet,
        votesPlayer1,
        votesPlayer2,
      });

      const args = [
        StellarSdk.nativeToScVal(matchId, { type: 'u32' }),
        StellarSdk.nativeToScVal(winnerWallet || '', { type: 'string' }),
        StellarSdk.nativeToScVal(Number(votesPlayer1 || 0), { type: 'u32' }),
        StellarSdk.nativeToScVal(Number(votesPlayer2 || 0), { type: 'u32' }),
      ];
      return this.invokeContract(process.env.STELLAR_FINALIZE_MATCH_FN || 'finalize_match', args);
    } catch (error) {
      logger.error('finalizeMatchOnChain failed', { message: error?.message, matchId });
      throw error;
    }
  }

  async refundDrawOnChain({ matchId, player1Wallet, player2Wallet }) {
    try {
      logger.info('refundDrawOnChain', {
        contractId: CONTRACT_ID,
        matchId,
        player1Wallet,
        player2Wallet,
      });

      const args = [
        StellarSdk.nativeToScVal(matchId, { type: 'u32' }),
        StellarSdk.nativeToScVal(player1Wallet || '', { type: 'string' }),
        StellarSdk.nativeToScVal(player2Wallet || '', { type: 'string' }),
      ];
      return this.invokeContract(process.env.STELLAR_REFUND_DRAW_FN || 'refund_draw', args);
    } catch (error) {
      logger.error('refundDrawOnChain failed', { message: error?.message, matchId });
      throw error;
    }
  }
}

module.exports = new BattleChainService();
