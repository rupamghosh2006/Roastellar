require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { rpcServer, NETWORK_PASSPHRASE } = require('../src/config/stellar');
const chainService = require('../src/modules/battles/services/battleChain.service');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function invokeContractDirect(method, args) {
  const { StellarSdk } = require('../src/config/stellar');
  const secret = chainService.getEscrowSecret();
  const publicKey = chainService.getEscrowPublic();
  const keypair = StellarSdk.Keypair.fromSecret(secret);
  const account = await rpcServer.getAccount(publicKey);

  const CONTRACT_ID = process.env.STELLAR_CONTRACT_ID || 'CBA5M4RLMEWHZ7CNKHA3P6HZ6WGXI7C7KY5TU7YMVZJH262FOAH6BBSA';
  const contract = new StellarSdk.Contract(CONTRACT_ID);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: String(StellarSdk.BASE_FEE || 100),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(60)
    .build();

  console.log(`Simulating ${method}...`);
  const simulated = await rpcServer.simulateTransaction(tx);
  if (simulated?.error) {
    throw new Error(`Simulate error: ${simulated.error}`);
  }

  console.log('Simulation successful, assembling transaction...');
  const assemble = StellarSdk.SorobanRpc.assembleTransaction;
  const prepared = assemble(tx, simulated, NETWORK_PASSPHRASE);
  prepared.sign(keypair);

  console.log('Sending transaction...');
  const sent = await rpcServer.sendTransaction(prepared);
  if (sent.status === 'ERROR') {
    throw new Error(`Send error: ${sent.errorResultXdr}`);
  }

  const hash = sent.hash;
  console.log(`Transaction sent, hash: ${hash}`);
  console.log('Waiting for confirmation...');

  for (let i = 0; i < 40; i++) {
    const result = await rpcServer.getTransaction(hash);
    if (result.status === 'SUCCESS') {
      console.log('Transaction confirmed (SUCCESS)');
      return { txHash: hash, returnValue: result.returnValue };
    }
    if (result.status === 'FAILED') {
      throw new Error(`Transaction FAILED: ${hash}`);
    }
    await sleep(1500);
  }
  throw new Error(`Transaction timed out: ${hash}`);
}

async function finalizeStuckBattles() {
  if (!MONGO_URI) {
    throw new Error('MONGODB_URI not set in environment');
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const Battle = require('../src/modules/battles/models/battle.model');
  const User = require('../src/modules/users/models/user.model');
  const Prediction = require('../src/modules/predictions/models/prediction.model');

  const matchIds = process.argv.slice(2).map(Number).filter((id) => Number.isFinite(id) && id > 0);
  if (matchIds.length === 0) {
    console.log('Usage: node scripts/finalize-stuck-battles.js <matchId1> [matchId2 ...]');
    console.log('No matchIds provided. Finding all stuck expired battles...');

    const stuckBattles = await Battle.find({
      expiresAt: { $lte: new Date() },
      status: { $in: ['active', 'voting'] },
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
    console.log(`\n--- Processing battle matchId: ${matchId} ---`);
    try {
      const battle = await Battle.findOne({ matchId });
      if (!battle) {
        console.error(`Battle ${matchId} not found in MongoDB`);
        continue;
      }

      if (['ended', 'draw', 'cancelled'].includes(battle.status)) {
        console.log(`Battle ${matchId} already in terminal state: ${battle.status}`);
        continue;
      }

      const onChainId = Number(battle.chain?.onChainMatchId);
      if (!Number.isFinite(onChainId) || onChainId <= 0) {
        console.error(`Battle ${matchId} missing on-chain match ID`);
        continue;
      }

      console.log(`On-chain match ID: ${onChainId}`);
      console.log(`Status: ${battle.status}, votes: ${battle.votesPlayer1} vs ${battle.votesPlayer2}`);

      const { StellarSdk } = require('../src/config/stellar');

      console.log('Calling finalize_match on contract...');
      const result = await invokeContractDirect('finalize_match', [
        StellarSdk.nativeToScVal(Number(onChainId), { type: 'u32' }),
      ]);
      console.log(`Contract call succeeded. txHash: ${result.txHash}`);

      const winnerId = battle.votesPlayer1 > battle.votesPlayer2
        ? String(battle.player1)
        : String(battle.player2);

      const isDraw = battle.votesPlayer1 === battle.votesPlayer2;

      battle.status = isDraw ? 'draw' : 'ended';
      battle.winner = isDraw ? null : winnerId;
      battle.endedAt = new Date();
      battle.txHash = result.txHash;
      battle.chain = {
        ...(battle.chain || {}),
        finalizeTxHash: result.txHash,
      };

      const player1 = await User.findById(battle.player1);
      const player2 = battle.player2 ? await User.findById(battle.player2) : null;

      if (player1) player1.totalBattles = Number(player1.totalBattles || 0) + 1;
      if (player2) player2.totalBattles = Number(player2.totalBattles || 0) + 1;

      if (!isDraw && winnerId) {
        const loserId = winnerId === String(battle.player1) ? String(battle.player2) : String(battle.player1);
        const winnerUser = winnerId === String(player1?._id) ? player1 : player2;
        const loserUser = loserId === String(player1?._id) ? player1 : player2;

        if (winnerUser) {
          winnerUser.wins = Number(winnerUser.wins || 0) + 1;
          winnerUser.xp = Number(winnerUser.xp || 0) + 100;
          winnerUser.rankPoints = Number(winnerUser.rankPoints || 0) + 25;
          if (!winnerUser.badges?.includes('First Blood')) {
            if (!winnerUser.badges) winnerUser.badges = [];
            winnerUser.badges.push('First Blood');
          }
        }
        if (loserUser) {
          loserUser.losses = Number(loserUser.losses || 0) + 1;
          loserUser.xp = Number(loserUser.xp || 0) + 15;
        }
      } else if (isDraw) {
        if (player1) player1.xp = Number(player1.xp || 0) + 20;
        if (player2) player2.xp = Number(player2.xp || 0) + 20;
      }

      if (player1) await player1.save();
      if (player2) await player2.save();

      await battle.save();
      console.log(`Battle ${matchId} finalized: ${battle.status}, winner: ${battle.winner || 'draw'}`);
    } catch (error) {
      console.error(`Failed to finalize matchId ${matchId}: ${error.message}`);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

finalizeStuckBattles().catch((err) => {
  console.error('Script failed:', err.message);
  process.exit(1);
});
