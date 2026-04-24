const Battle = require('../models/battle.model');
const BattleVote = require('../models/battleVote.model');
const BattleCounter = require('../models/battleCounter.model');
const Prediction = require('../../predictions/models/prediction.model');
const User = require('../../users/models/user.model');
const Analytics = require('../../analytics/models/analytics.model');
const ipfsService = require('./ipfs.service');
const chainService = require('./battleChain.service');
const escrowService = require('./battleEscrow.service');
const timerService = require('./battleTimer.service');
const { getIO } = require('../../../config/socket');
const logger = require('../../../utils/logger');

const ROAST_PHASE_SECONDS = Number(process.env.BATTLE_ROAST_SECONDS || 60);
const VOTING_PHASE_SECONDS = Number(process.env.BATTLE_VOTING_SECONDS || 30);
const VOTE_STAKE_XLM = Number(process.env.BATTLE_VOTE_STAKE_XLM || 0);

function sanitizeText(value, max = 280) {
  const text = String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.slice(0, max);
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function trackEvent(eventType, userId, metadata = {}) {
  try {
    await Analytics.create({
      eventType,
      userId: userId || null,
      metadata,
    });
  } catch (error) {
    logger.warn('Analytics create failed', { eventType, message: error?.message });
  }
}

async function nextMatchId() {
  const counter = await BattleCounter.findOneAndUpdate(
    { key: 'battle_match_id' },
    { $inc: { value: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return counter.value;
}

function winnerPayload(battle) {
  return {
    matchId: battle.matchId,
    status: battle.status,
    winnerId: battle.winner ? String(battle.winner) : null,
    votesPlayer1: battle.votesPlayer1,
    votesPlayer2: battle.votesPlayer2,
    txHash: battle.txHash || '',
    endedAt: battle.endedAt,
  };
}

function getOnChainMatchId(battle) {
  const onChainMatchId = Number(battle?.chain?.onChainMatchId || 0);
  if (!Number.isFinite(onChainMatchId) || onChainMatchId <= 0) {
    throw new Error('Battle missing mirrored on-chain match id');
  }
  return onChainMatchId;
}

class BattleService {
  normalizeBattle(battleDoc) {
    return battleDoc?.toJSON ? battleDoc.toJSON() : battleDoc;
  }

  async serializeByMatchId(matchId) {
    const battle = await Battle.findOne({ matchId })
      .populate('creator', 'username avatar imageUrl clerkId xp wins losses rankPoints badges walletPublicKey')
      .populate('player1', 'username avatar imageUrl clerkId xp wins losses rankPoints badges walletPublicKey')
      .populate('player2', 'username avatar imageUrl clerkId xp wins losses rankPoints badges walletPublicKey')
      .populate('winner', 'username avatar imageUrl clerkId xp wins losses rankPoints badges walletPublicKey');

    if (!battle) {
      return null;
    }

    return battle.toJSON();
  }

  async getOpenBattles(limit = 30) {
    const battles = await Battle.find({ status: 'open' })
      .populate('creator', 'username avatar imageUrl')
      .populate('player1', 'username avatar imageUrl')
      .sort({ createdAt: -1 })
      .limit(limit);

    return battles.map((battle) => battle.toJSON());
  }

  async getBattleByMatchId(matchId) {
    const serialized = await this.serializeByMatchId(matchId);
    if (!serialized) {
      throw new Error('Battle not found');
    }
    return serialized;
  }

  async createBattle({ user, topic, entryFee }) {
    if (!user?.walletPublicKey || !user?.walletEncryptedSecret) {
      throw new Error('Wallet with signing capability is required to create battle');
    }

    const safeTopic = sanitizeText(topic, 120);
    if (!safeTopic) {
      throw new Error('Topic is required');
    }

    const fee = toNumber(entryFee, 1);
    if (fee <= 0) {
      throw new Error('Entry fee must be greater than zero');
    }

    const matchId = await nextMatchId();
    const uploadedTopicCid = await ipfsService.uploadJSON(
      {
        topic: safeTopic,
        matchId,
        createdBy: user.clerkId,
      },
      `battle-topic-${matchId}`
    );
    const topicCid = uploadedTopicCid || `local-topic-${matchId}`;

    const entryTxHash = await escrowService.transferFromUserToEscrow({
      user,
      amountXlm: fee,
      memo: `battle_entry_${matchId}`,
    });

    let chainCreate = null;
    try {
      chainCreate = await chainService.createMatchOnChain({
        entryFee: fee,
        topicCid,
        sourceSecret: escrowService.getUserSecret(user),
        sourcePublic: user.walletPublicKey,
      });
    } catch (error) {
      try {
        await escrowService.transferFromEscrow({
          toPublicKey: user.walletPublicKey,
          amountXlm: fee,
          memo: `entry_refund_${matchId}`,
        });
      } catch (refundError) {
        logger.error('Entry refund failed after create_match failure', {
          matchId,
          message: refundError?.message,
        });
      }
      throw error;
    }

    const battle = await Battle.create({
      matchId,
      creator: user._id,
      player1: user._id,
      player1Wallet: user.walletPublicKey,
      topic: safeTopic,
      topicCid,
      entryFee: fee,
      status: 'open',
      txHash: chainCreate.txHash,
      chain: {
        onChainMatchId: chainCreate.onChainMatchId,
        createTxHash: chainCreate.txHash,
        voteTxHashes: [],
      },
      finance: {
        entryTxPlayer1: entryTxHash,
        entryTxPlayer2: '',
        voteStakeTxHashes: [],
        payoutTxHashes: [],
      },
    });

    await trackEvent('battle_created', user._id, {
      matchId,
      entryFee: fee,
      onChainMatchId: chainCreate.onChainMatchId,
      entryTxHash,
      createTxHash: chainCreate.txHash,
    });

    const io = getIO();
    if (io) {
      io.to('lobby').emit('open_battles_updated', await this.getOpenBattles());
    }

    return this.getBattleByMatchId(battle.matchId);
  }

  async joinBattle({ user, matchId }) {
    if (!user?.walletPublicKey || !user?.walletEncryptedSecret) {
      throw new Error('Wallet with signing capability is required to join battle');
    }

    const battle = await Battle.findOne({ matchId });
    if (!battle) {
      throw new Error('Battle not found');
    }
    if (battle.status !== 'open') {
      throw new Error('Battle is not open');
    }
    if (String(battle.player1) === String(user._id)) {
      throw new Error('Cannot join your own battle');
    }

    const now = new Date();
    const updated = await Battle.findOneAndUpdate(
      { _id: battle._id, status: 'open', player2: null },
      {
        $set: {
          player2: user._id,
          player2Wallet: user.walletPublicKey,
          status: 'active',
          startedAt: now,
        },
      },
      { new: true }
    );
    if (!updated) {
      throw new Error('Battle was already joined by another player');
    }

    const onChainMatchId = getOnChainMatchId(updated);
    let entryTxHash = '';
    try {
      entryTxHash = await escrowService.transferFromUserToEscrow({
        user,
        amountXlm: updated.entryFee,
        memo: `battle_entry_${updated.matchId}_p2`,
      });
      const joinTxHash = await chainService.joinMatchOnChain({
        onChainMatchId,
        playerPublic: user.walletPublicKey,
        sourceSecret: escrowService.getUserSecret(user),
      });
      updated.chain = {
        ...(updated.chain || {}),
        joinTxHash,
      };
      updated.finance = {
        ...(updated.finance || {}),
        entryTxPlayer2: entryTxHash,
      };
      await updated.save();
    } catch (error) {
      if (entryTxHash) {
        try {
          await escrowService.transferFromEscrow({
            toPublicKey: user.walletPublicKey,
            amountXlm: updated.entryFee,
            memo: `entry_refund_${updated.matchId}_p2`,
          });
        } catch (refundError) {
          logger.error('Join entry refund failed', { matchId, message: refundError?.message });
        }
      }
      updated.player2 = null;
      updated.player2Wallet = '';
      updated.status = 'open';
      updated.startedAt = null;
      await updated.save();
      throw error;
    }

    await trackEvent('battle_joined', user._id, { matchId, onChainMatchId, entryTxHash });

    this.startRoastTimer(updated.matchId);

    const io = getIO();
    if (io) {
      io.to(`battle_${updated.matchId}`).emit('player_joined', {
        matchId: updated.matchId,
        playerId: String(user._id),
      });
      io.to(`battle_${updated.matchId}`).emit('battle_started', {
        matchId: updated.matchId,
        durationSec: ROAST_PHASE_SECONDS,
      });
      io.to('lobby').emit('open_battles_updated', await this.getOpenBattles());
    }

    return this.getBattleByMatchId(updated.matchId);
  }

  startRoastTimer(matchId) {
    const io = getIO();
    timerService.schedule({
      matchId: `roast_${matchId}`,
      durationSec: ROAST_PHASE_SECONDS,
      onTick: (remaining) => {
        io?.to(`battle_${matchId}`).emit('countdown_tick', {
          matchId,
          phase: 'active',
          remaining,
        });
      },
      onExpire: async () => {
        const battle = await Battle.findOne({ matchId });
        if (!battle || battle.status !== 'active') return;
        if (battle.roast1 && battle.roast2) return;

        // Contract finalize requires both roasts mirrored on-chain.
        // If roast phase ends incomplete, cancel and refund escrowed funds.
        battle.status = 'cancelled';
        battle.endedAt = new Date();
        const refundTxHashes = await this.refundBattleEscrowOnCancel(battle);
        battle.finance = {
          ...(battle.finance || {}),
          payoutTxHashes: [...((battle.finance || {}).payoutTxHashes || []), ...refundTxHashes],
        };
        await battle.save();
        timerService.clear(`roast_${matchId}`);
        io?.to(`battle_${matchId}`).emit('battle_result', winnerPayload(battle));
      },
    });
  }

  startVotingTimer(matchId) {
    const io = getIO();
    timerService.schedule({
      matchId: `voting_${matchId}`,
      durationSec: VOTING_PHASE_SECONDS,
      onTick: (remaining) => {
        io?.to(`battle_${matchId}`).emit('countdown_tick', {
          matchId,
          phase: 'voting',
          remaining,
        });
      },
      onExpire: async () => {
        try {
          await this.finalizeBattle({ matchId, actorUserId: null, internalCall: true });
        } catch (error) {
          logger.error('Auto finalize failed', { matchId, message: error?.message });
        }
      },
    });
  }

  async submitRoast({ user, matchId, text }) {
    const battle = await Battle.findOne({ matchId });
    if (!battle) throw new Error('Battle not found');
    if (battle.status !== 'active') throw new Error('Battle is not accepting roast submissions');

    const safeText = sanitizeText(text, 500);
    if (!safeText) throw new Error('Roast text is required');

    const isPlayer1 = String(battle.player1) === String(user._id);
    const isPlayer2 = String(battle.player2) === String(user._id);
    if (!isPlayer1 && !isPlayer2) throw new Error('Only players can submit roasts');

    const uploadedRoastCid = await ipfsService.uploadJSON(
      { matchId, playerId: String(user._id), roast: safeText },
      `battle-roast-${matchId}-${String(user._id).slice(-6)}`
    );
    const roastCid = uploadedRoastCid || `local-roast-${matchId}-${String(user._id).slice(-6)}`;

    const onChainMatchId = getOnChainMatchId(battle);
    const playerPublic = isPlayer1 ? battle.player1Wallet : battle.player2Wallet;
    if (!playerPublic) {
      throw new Error('Missing player wallet for on-chain roast mirroring');
    }

    const roastTxHash = await chainService.submitRoastOnChain({
      onChainMatchId,
      roastCid,
      playerPublic,
      sourceSecret: escrowService.getUserSecret(user),
    });

    if (isPlayer1) {
      battle.roast1 = safeText;
      battle.roast1Cid = roastCid;
      battle.chain = { ...(battle.chain || {}), roast1TxHash: roastTxHash };
    }
    if (isPlayer2) {
      battle.roast2 = safeText;
      battle.roast2Cid = roastCid;
      battle.chain = { ...(battle.chain || {}), roast2TxHash: roastTxHash };
    }

    const bothReady = Boolean(battle.roast1 && battle.roast2);
    if (bothReady && battle.status !== 'voting') {
      battle.status = 'voting';
    }

    await battle.save();
    await trackEvent('roast_submitted', user._id, { matchId, roastTxHash });

    const io = getIO();
    io?.to(`battle_${matchId}`).emit('roast_submitted', {
      matchId,
      userId: String(user._id),
      roast: safeText,
    });

    if (bothReady) {
      timerService.clear(`roast_${matchId}`);
      this.startVotingTimer(matchId);
      io?.to(`battle_${matchId}`).emit('voting_started', {
        matchId,
        durationSec: VOTING_PHASE_SECONDS,
      });
    }

    return this.getBattleByMatchId(matchId);
  }

  async castVote({ user, matchId, selectedPlayer }) {
    const battle = await Battle.findOne({ matchId });
    if (!battle) throw new Error('Battle not found');
    if (battle.status !== 'voting') throw new Error('Battle is not in voting window');
    if (String(user._id) === String(battle.player1) || String(user._id) === String(battle.player2)) {
      throw new Error('Players cannot vote in their own battle');
    }

    const selected = String(selectedPlayer || '');
    const validSelection = [String(battle.player1), String(battle.player2)].includes(selected);
    if (!validSelection) throw new Error('Invalid selected player');

    const existing = await BattleVote.findOne({ battleId: battle._id, voter: user._id });
    if (existing) throw new Error('Vote already recorded');

    const selectedPlayerPublic = selected === String(battle.player1) ? battle.player1Wallet : battle.player2Wallet;
    if (!selectedPlayerPublic) throw new Error('Missing selected player wallet for mirrored on-chain vote');

    let voteStakeTxHash = '';
    if (VOTE_STAKE_XLM > 0) {
      voteStakeTxHash = await escrowService.transferFromUserToEscrow({
        user,
        amountXlm: VOTE_STAKE_XLM,
        memo: `vote_stake_${matchId}`,
      });
    }

    let voteTxHash = '';
    try {
      voteTxHash = await chainService.voteOnChain({
        onChainMatchId: getOnChainMatchId(battle),
        selectedPlayerPublic,
        voterPublic: user.walletPublicKey,
        sourceSecret: escrowService.getUserSecret(user),
      });
    } catch (error) {
      if (voteStakeTxHash) {
        try {
          await escrowService.transferFromEscrow({
            toPublicKey: user.walletPublicKey,
            amountXlm: VOTE_STAKE_XLM,
            memo: `vote_refund_${matchId}`,
          });
        } catch (refundError) {
          logger.error('Vote stake refund failed', { matchId, message: refundError?.message });
        }
      }
      throw error;
    }

    await BattleVote.create({
      battleId: battle._id,
      voter: user._id,
      selectedPlayer: selected,
    });

    if (selected === String(battle.player1)) {
      battle.votesPlayer1 += 1;
    } else {
      battle.votesPlayer2 += 1;
    }
    battle.chain = {
      ...(battle.chain || {}),
      voteTxHashes: [...((battle.chain || {}).voteTxHashes || []), voteTxHash],
    };
    if (voteStakeTxHash) {
      battle.finance = {
        ...(battle.finance || {}),
        voteStakeTxHashes: [...((battle.finance || {}).voteStakeTxHashes || []), voteStakeTxHash],
      };
    }
    await battle.save();

    await trackEvent('vote_cast', user._id, { matchId, selectedPlayer: selected, voteTxHash, voteStakeTxHash });

    const io = getIO();
    io?.to(`battle_${matchId}`).emit('vote_update', {
      matchId,
      votesPlayer1: battle.votesPlayer1,
      votesPlayer2: battle.votesPlayer2,
    });

    return this.getBattleByMatchId(matchId);
  }

  async placePrediction({ user, matchId, selectedPlayer, amount }) {
    const battle = await Battle.findOne({ matchId });
    if (!battle) throw new Error('Battle not found');
    if (!['active', 'voting'].includes(battle.status)) throw new Error('Battle is not accepting predictions');
    if (String(user._id) === String(battle.player1) || String(user._id) === String(battle.player2)) {
      throw new Error('Players cannot place predictions');
    }

    const selected = String(selectedPlayer || '');
    const validSelection = [String(battle.player1), String(battle.player2)].includes(selected);
    if (!validSelection) throw new Error('Invalid selected player');

    const parsedAmount = toNumber(amount, 0);
    if (parsedAmount <= 0) throw new Error('Prediction amount must be greater than zero');

    const existing = await Prediction.findOne({ battleId: battle._id, predictor: user._id });
    if (existing) throw new Error('Prediction already placed');

    const selectedPlayerPublic = selected === String(battle.player1) ? battle.player1Wallet : battle.player2Wallet;
    if (!selectedPlayerPublic) throw new Error('Missing selected player wallet for mirrored on-chain prediction');

    const escrowTxHash = await escrowService.transferFromUserToEscrow({
      user,
      amountXlm: parsedAmount,
      memo: `prediction_${matchId}`,
    });

    let chainTxHash = '';
    try {
      chainTxHash = await chainService.predictOnChain({
        onChainMatchId: getOnChainMatchId(battle),
        selectedPlayerPublic,
        amount: parsedAmount,
        predictorPublic: user.walletPublicKey,
        sourceSecret: escrowService.getUserSecret(user),
      });
    } catch (error) {
      try {
        await escrowService.transferFromEscrow({
          toPublicKey: user.walletPublicKey,
          amountXlm: parsedAmount,
          memo: `prediction_refund_${matchId}`,
        });
      } catch (refundError) {
        logger.error('Prediction refund failed', { matchId, message: refundError?.message });
      }
      throw error;
    }

    const prediction = await Prediction.create({
      battleId: battle._id,
      predictor: user._id,
      selectedPlayer: selected,
      amount: parsedAmount,
      escrowTxHash,
      chainTxHash,
    });

    battle.finance = {
      ...(battle.finance || {}),
      predictionPool: toNumber((battle.finance || {}).predictionPool, 0) + parsedAmount,
    };
    await battle.save();

    await trackEvent('prediction_placed', user._id, {
      matchId,
      selectedPlayer: selected,
      amount: parsedAmount,
      escrowTxHash,
      chainTxHash,
    });

    const io = getIO();
    io?.to(`battle_${matchId}`).emit('prediction_placed', {
      matchId,
      predictorId: String(user._id),
      selectedPlayer: selected,
      amount: parsedAmount,
    });

    return prediction;
  }

  async settlePredictions({ battle }) {
    const predictions = await Prediction.find({ battleId: battle._id, settled: false });
    if (predictions.length === 0) return [];

    const payoutHashes = [];
    const predictorIds = predictions.map((prediction) => prediction.predictor);
    const predictorUsers = await User.find({ _id: { $in: predictorIds } }).select('_id walletPublicKey');
    const walletByUserId = new Map(predictorUsers.map((user) => [String(user._id), user.walletPublicKey]));

    if (battle.status === 'draw' || !battle.winner) {
      for (const prediction of predictions) {
        prediction.settled = true;
        prediction.won = false;
        const wallet = walletByUserId.get(String(prediction.predictor));
        if (wallet) {
          prediction.payoutTxHash = await escrowService.transferFromEscrow({
            toPublicKey: wallet,
            amountXlm: prediction.amount,
            memo: `pred_refund_${battle.matchId}`,
          });
          payoutHashes.push(prediction.payoutTxHash);
        }
        await prediction.save();
      }
      return payoutHashes;
    }

    const winnerId = String(battle.winner);
    const winningPredictions = predictions.filter((prediction) => String(prediction.selectedPlayer) === winnerId);
    const totalPool = predictions.reduce((sum, prediction) => sum + toNumber(prediction.amount, 0), 0);
    const winnersPool = winningPredictions.reduce((sum, prediction) => sum + toNumber(prediction.amount, 0), 0);

    if (winningPredictions.length === 0 || winnersPool <= 0) {
      for (const prediction of predictions) {
        prediction.settled = true;
        prediction.won = false;
        const wallet = walletByUserId.get(String(prediction.predictor));
        if (wallet) {
          prediction.payoutTxHash = await escrowService.transferFromEscrow({
            toPublicKey: wallet,
            amountXlm: prediction.amount,
            memo: `pred_refund_${battle.matchId}`,
          });
          payoutHashes.push(prediction.payoutTxHash);
        }
        await prediction.save();
      }
      return payoutHashes;
    }

    let distributed = 0;
    for (let index = 0; index < winningPredictions.length; index += 1) {
      const prediction = winningPredictions[index];
      const wallet = walletByUserId.get(String(prediction.predictor));
      prediction.settled = true;
      prediction.won = true;
      if (wallet) {
        let payout = Number((totalPool * (toNumber(prediction.amount, 0) / winnersPool)).toFixed(7));
        if (index === winningPredictions.length - 1) {
          payout = Number((totalPool - distributed).toFixed(7));
        }
        distributed = Number((distributed + payout).toFixed(7));
        prediction.payoutTxHash = await escrowService.transferFromEscrow({
          toPublicKey: wallet,
          amountXlm: payout,
          memo: `pred_win_${battle.matchId}`,
        });
        payoutHashes.push(prediction.payoutTxHash);
      }
      await prediction.save();
    }

    const losers = predictions.filter((prediction) => String(prediction.selectedPlayer) !== winnerId);
    for (const prediction of losers) {
      prediction.settled = true;
      prediction.won = false;
      await prediction.save();
    }

    return payoutHashes;
  }

  async refundBattleEscrowOnCancel(battle) {
    const refundTxHashes = [];

    if (battle.finance?.entryTxPlayer1 && battle.player1Wallet) {
      refundTxHashes.push(await escrowService.transferFromEscrow({
        toPublicKey: battle.player1Wallet,
        amountXlm: battle.entryFee,
        memo: `cancel_refund_${battle.matchId}_p1`,
      }));
    }

    if (battle.finance?.entryTxPlayer2 && battle.player2Wallet) {
      refundTxHashes.push(await escrowService.transferFromEscrow({
        toPublicKey: battle.player2Wallet,
        amountXlm: battle.entryFee,
        memo: `cancel_refund_${battle.matchId}_p2`,
      }));
    }

    const pendingPredictions = await Prediction.find({
      battleId: battle._id,
      settled: false,
    });
    if (pendingPredictions.length > 0) {
      const predictorIds = pendingPredictions.map((prediction) => prediction.predictor);
      const predictorUsers = await User.find({ _id: { $in: predictorIds } }).select('_id walletPublicKey');
      const walletByUserId = new Map(predictorUsers.map((user) => [String(user._id), user.walletPublicKey]));

      for (const prediction of pendingPredictions) {
        const wallet = walletByUserId.get(String(prediction.predictor));
        if (wallet) {
          prediction.payoutTxHash = await escrowService.transferFromEscrow({
            toPublicKey: wallet,
            amountXlm: prediction.amount,
            memo: `pred_cancel_refund_${battle.matchId}`,
          });
          refundTxHashes.push(prediction.payoutTxHash);
        }
        prediction.settled = true;
        prediction.won = false;
        await prediction.save();
      }
    }

    return refundTxHashes;
  }

  async finalizeBattle({ matchId, actorUserId, internalCall = false }) {
    timerService.clear(`roast_${matchId}`);
    timerService.clear(`voting_${matchId}`);

    const battle = await Battle.findOne({ matchId });
    if (!battle) throw new Error('Battle not found');

    if (!['active', 'voting'].includes(battle.status)) {
      if (!internalCall) throw new Error('Battle cannot be finalized in current state');
      return this.getBattleByMatchId(matchId);
    }

    if (!battle.chain?.onChainMatchId || !battle.chain?.joinTxHash || !battle.chain?.roast1TxHash || !battle.chain?.roast2TxHash) {
      throw new Error('Battle is not fully mirrored on-chain yet');
    }

    const vote1 = battle.votesPlayer1;
    const vote2 = battle.votesPlayer2;
    battle.endedAt = new Date();

    const onChainMatchId = getOnChainMatchId(battle);
    if (vote1 === vote2) {
      battle.status = 'draw';
      battle.winner = null;
      battle.txHash = await chainService.refundDrawOnChain({ onChainMatchId });
    } else {
      battle.status = 'ended';
      battle.winner = vote1 > vote2 ? battle.player1 : battle.player2;
      battle.txHash = await chainService.finalizeMatchOnChain({ onChainMatchId });
    }
    battle.chain = {
      ...(battle.chain || {}),
      finalizeTxHash: battle.txHash,
    };

    const payoutTxHashes = [];
    if (battle.status === 'draw') {
      if (battle.finance?.entryTxPlayer1 && battle.player1Wallet) {
        payoutTxHashes.push(await escrowService.transferFromEscrow({
          toPublicKey: battle.player1Wallet,
          amountXlm: battle.entryFee,
          memo: `draw_refund_${matchId}_p1`,
        }));
      }
      if (battle.finance?.entryTxPlayer2 && battle.player2Wallet) {
        payoutTxHashes.push(await escrowService.transferFromEscrow({
          toPublicKey: battle.player2Wallet,
          amountXlm: battle.entryFee,
          memo: `draw_refund_${matchId}_p2`,
        }));
      }
    } else if (battle.winner) {
      const winnerUser = await User.findById(battle.winner).select('walletPublicKey');
      const winnerWallet = winnerUser?.walletPublicKey;
      const entryPot =
        (battle.finance?.entryTxPlayer1 ? battle.entryFee : 0) +
        (battle.finance?.entryTxPlayer2 ? battle.entryFee : 0);
      if (winnerWallet && entryPot > 0) {
        payoutTxHashes.push(await escrowService.transferFromEscrow({
          toPublicKey: winnerWallet,
          amountXlm: entryPot,
          memo: `battle_win_${matchId}`,
        }));
      }
    }

    const predictionPayoutTxs = await this.settlePredictions({ battle });
    battle.finance = {
      ...(battle.finance || {}),
      payoutTxHashes: [...((battle.finance || {}).payoutTxHashes || []), ...payoutTxHashes, ...predictionPayoutTxs],
    };

    await battle.save();

    const serializedBattle = this.normalizeBattle(await Battle.findById(battle._id));
    if (serializedBattle) {
      const resultCid = await ipfsService.uploadJSON(
        {
          matchId,
          status: serializedBattle.status,
          winner: serializedBattle.winner || null,
          votesPlayer1: serializedBattle.votesPlayer1,
          votesPlayer2: serializedBattle.votesPlayer2,
          entryFee: serializedBattle.entryFee,
          txHash: serializedBattle.txHash || '',
          endedAt: serializedBattle.endedAt,
        },
        `battle-result-${matchId}`
      );
      if (resultCid) {
        await trackEvent('battle_result_metadata_uploaded', actorUserId, { matchId, resultCid });
      }
    }

    const player1 = await User.findById(battle.player1);
    const player2 = battle.player2 ? await User.findById(battle.player2) : null;

    if (player1) player1.totalBattles = toNumber(player1.totalBattles, 0) + 1;
    if (player2) player2.totalBattles = toNumber(player2.totalBattles, 0) + 1;

    if (battle.status === 'ended' && battle.winner) {
      const winnerId = String(battle.winner);
      const loserId = winnerId === String(battle.player1) ? String(battle.player2) : String(battle.player1);
      const winnerUser = winnerId === String(player1?._id) ? player1 : player2;
      const loserUser = loserId === String(player1?._id) ? player1 : player2;

      if (winnerUser) {
        winnerUser.wins = toNumber(winnerUser.wins, 0) + 1;
        winnerUser.xp = toNumber(winnerUser.xp, 0) + 100;
        winnerUser.rankPoints = toNumber(winnerUser.rankPoints, 0) + 25;
        if (!winnerUser.badges.includes('First Blood')) winnerUser.badges.push('First Blood');
      }
      if (loserUser) {
        loserUser.losses = toNumber(loserUser.losses, 0) + 1;
        loserUser.xp = toNumber(loserUser.xp, 0) + 15;
      }
    } else {
      if (player1) player1.xp = toNumber(player1.xp, 0) + 20;
      if (player2) player2.xp = toNumber(player2.xp, 0) + 20;
    }

    if (player1) await player1.save();
    if (player2) await player2.save();

    await trackEvent('battle_finished', actorUserId, {
      matchId,
      status: battle.status,
      winner: battle.winner ? String(battle.winner) : null,
      finalizeTxHash: battle.txHash,
      payoutTxHashes,
      predictionPayoutTxs,
    });

    const io = getIO();
    if (io) {
      io.to(`battle_${matchId}`).emit('battle_result', winnerPayload(battle));
      const leaderboard = await User.find({ isBanned: false })
        .sort({ rankPoints: -1, xp: -1, wins: -1 })
        .limit(50)
        .select('username avatar imageUrl xp wins losses rankPoints clerkId badges totalBattles');
      io.to('lobby').emit('leaderboard_updated', leaderboard.map((user) => user.toPublicJSON()));
    }

    return this.getBattleByMatchId(matchId);
  }

  async cancelBattle({ user, matchId }) {
    timerService.clear(`roast_${matchId}`);
    timerService.clear(`voting_${matchId}`);

    const battle = await Battle.findOne({ matchId });
    if (!battle) throw new Error('Battle not found');
    if (battle.status !== 'open') throw new Error('Only open battles can be cancelled');
    if (String(battle.creator) !== String(user._id)) throw new Error('Only creator can cancel this battle');

    const refundTxHashes = await this.refundBattleEscrowOnCancel(battle);

    battle.status = 'cancelled';
    battle.endedAt = new Date();
    battle.finance = {
      ...(battle.finance || {}),
      payoutTxHashes: [...((battle.finance || {}).payoutTxHashes || []), ...refundTxHashes],
    };
    await battle.save();

    await trackEvent('battle_cancelled', user._id, { matchId });
    const io = getIO();
    io?.to('lobby').emit('open_battles_updated', await this.getOpenBattles());

    return this.getBattleByMatchId(matchId);
  }

  async predictionSummary(matchId) {
    const battle = await Battle.findOne({ matchId });
    if (!battle) throw new Error('Battle not found');

    const predictions = await Prediction.find({ battleId: battle._id });
    const totalAmount = predictions.reduce((sum, prediction) => sum + toNumber(prediction.amount, 0), 0);
    const onPlayer1 = predictions
      .filter((prediction) => String(prediction.selectedPlayer) === String(battle.player1))
      .reduce((sum, prediction) => sum + toNumber(prediction.amount, 0), 0);
    const onPlayer2 = predictions
      .filter((prediction) => String(prediction.selectedPlayer) === String(battle.player2))
      .reduce((sum, prediction) => sum + toNumber(prediction.amount, 0), 0);

    return {
      matchId,
      totalPredictions: predictions.length,
      totalAmount,
      onPlayer1,
      onPlayer2,
    };
  }
}

module.exports = new BattleService();
