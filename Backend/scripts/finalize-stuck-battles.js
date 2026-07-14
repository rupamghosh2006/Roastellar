require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const battleService = require('../src/modules/battles/services/battle.service');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';

async function finalizeStuckBattles() {
  if (!MONGO_URI) {
    throw new Error('MONGODB_URI not set in environment');
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const matchIds = process.argv.slice(2).map(Number).filter((id) => Number.isFinite(id) && id > 0);
  if (matchIds.length === 0) {
    console.log('Usage: node scripts/finalize-stuck-battles.js <matchId1> [matchId2 ...]');
    console.log('No matchIds provided. Finding all stuck expired battles...');

    const Battle = require('../src/modules/battles/models/battle.model');
    const stuckBattles = await Battle.find({
      expiresAt: { $lte: new Date() },
      status: { $in: ['open', 'active', 'voting'] },
    });

    if (stuckBattles.length === 0) {
      console.log('No stuck battles found.');
      await mongoose.disconnect();
      return;
    }

    console.log(`Found ${stuckBattles.length} stuck battle(s): ${stuckBattles.map((b) => b.matchId).join(', ')}`);
    for (const battle of stuckBattles) {
      matchIds.push(battle.matchId);
    }
  }

  for (const matchId of matchIds) {
    console.log(`\n--- Finalizing battle matchId: ${matchId} ---`);
    try {
      const result = await battleService.finalizeBattle({
        matchId,
        actorUserId: null,
        internalCall: true,
      });
      console.log(`Success: matchId ${matchId} finalized`, {
        status: result.status,
        winner: result.winner,
        votesPlayer1: result.votesPlayer1,
        votesPlayer2: result.votesPlayer2,
        txHash: result.txHash ? result.txHash.substring(0, 20) + '...' : null,
      });
    } catch (error) {
      console.error(`Failed to finalize matchId ${matchId}: ${error.message}`);
    }
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

finalizeStuckBattles().catch((err) => {
  console.error('Script failed:', err.message);
  process.exit(1);
});
