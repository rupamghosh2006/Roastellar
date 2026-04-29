const Analytics = require('../models/analytics.model');
const User = require('../../users/models/user.model');
const Battle = require('../../battles/models/battle.model');
const Prediction = require('../../predictions/models/prediction.model');
const BattleVote = require('../../battles/models/battleVote.model');
const logger = require('../../../utils/logger');

const TRACKING_STARTED_AT = '2026-04-29T00:00:00.000Z';

async function trackEvent(eventType, userId = null, metadata = {}) {
  try {
    await Analytics.create({
      eventType,
      userId: userId || null,
      metadata,
    });
  } catch (error) {
    logger.warn('Analytics track event failed', { eventType, message: error?.message });
  }
}

async function getPublicMetrics() {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    onboardedUsers,
    walletCreatedUsers,
    totalBattles,
    openBattles,
    activeBattles,
    votingBattles,
    endedBattles,
    totalVotes,
    totalPredictions,
    eventsLast24h,
  ] = await Promise.all([
    User.countDocuments({ isBanned: false }),
    User.countDocuments({ onboardingCompleted: true, isBanned: false }),
    User.countDocuments({ walletPublicKey: { $exists: true, $ne: '' }, isBanned: false }),
    Battle.countDocuments(),
    Battle.countDocuments({ status: 'open' }),
    Battle.countDocuments({ status: 'active' }),
    Battle.countDocuments({ status: 'voting' }),
    Battle.countDocuments({ status: { $in: ['ended', 'draw', 'cancelled'] } }),
    BattleVote.countDocuments(),
    Prediction.countDocuments(),
    Analytics.countDocuments({ timestamp: { $gte: last24h } }),
  ]);

  return {
    trackingStartedAt: TRACKING_STARTED_AT,
    totalUsers,
    onboardedUsers,
    walletCreatedUsers,
    totalBattles,
    openBattles,
    activeBattles,
    votingBattles,
    endedBattles,
    totalVotes,
    totalPredictions,
    eventsLast24h,
  };
}

module.exports = {
  trackEvent,
  getPublicMetrics,
  TRACKING_STARTED_AT,
};
