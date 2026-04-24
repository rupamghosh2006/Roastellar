const crypto = require('crypto');
const logger = require('../../../utils/logger');

const CONTRACT_ID = process.env.STELLAR_CONTRACT_ID || 'CBSSWTY2IX3Y4UAE2S7FT4TX25FS65QFCKR4JYZVMNXIKTKCBF3TF3OJ';

class BattleChainService {
  async createMatchOnChain({ matchId, player1Wallet, topicCid, entryFee }) {
    try {
      logger.info('createMatchOnChain', {
        contractId: CONTRACT_ID,
        matchId,
        player1Wallet,
        topicCid,
        entryFee,
      });

      return `sim_create_${crypto.randomBytes(8).toString('hex')}`;
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

      return `sim_finalize_${crypto.randomBytes(8).toString('hex')}`;
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

      return `sim_refund_${crypto.randomBytes(8).toString('hex')}`;
    } catch (error) {
      logger.error('refundDrawOnChain failed', { message: error?.message, matchId });
      throw error;
    }
  }
}

module.exports = new BattleChainService();
