const battleService = require('../modules/battles/services/battle.service');
const Battle = require('../modules/battles/models/battle.model');

function userPayload(user) {
  return {
    id: String(user._id),
    clerkId: user.clerkId,
    username: user.username,
    avatar: user.avatar || user.imageUrl || '',
  };
}

async function emitSpectatorCount(io, matchId) {
  try {
    const room = `battle_${matchId}`;
    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
    await Battle.updateOne({ matchId: Number(matchId) }, { spectatorsCount: roomSize });
    io.to(room).emit('spectator_count', { matchId: Number(matchId), count: roomSize });
  } catch (_) {
    // Ignore room metric updates if Mongo write fails.
  }
}

function registerBattleSocketHandlers(io, socket) {
  const user = socket.data.user;
  const joinedBattleRooms = new Set();

  socket.on('join_lobby', async () => {
    socket.join('lobby');
    io.to('lobby').emit('open_battles_updated', await battleService.getOpenBattles());
  });

  socket.on('join_battle', async ({ matchId }) => {
    const numericMatchId = Number(matchId);
    if (!Number.isFinite(numericMatchId) || numericMatchId <= 0) {
      socket.emit('error_message', { message: 'Invalid matchId' });
      return;
    }

    const room = `battle_${numericMatchId}`;
    socket.join(room);
    joinedBattleRooms.add(room);
    await emitSpectatorCount(io, numericMatchId);
    io.to(room).emit('player_joined', {
      matchId: numericMatchId,
      user: userPayload(user),
    });
  });

  socket.on('leave_battle', async ({ matchId }) => {
    const numericMatchId = Number(matchId);
    if (!Number.isFinite(numericMatchId) || numericMatchId <= 0) {
      return;
    }

    const room = `battle_${numericMatchId}`;
    socket.leave(room);
    joinedBattleRooms.delete(room);
    await emitSpectatorCount(io, numericMatchId);
  });

  socket.on('start_match', async ({ matchId }) => {
    try {
      const numericMatchId = Number(matchId);
      const battle = await battleService.joinBattle({
        user,
        matchId: numericMatchId,
      });
      io.to(`battle_${numericMatchId}`).emit('battle_started', {
        matchId: numericMatchId,
        battle,
      });
    } catch (error) {
      socket.emit('error_message', { message: error.message || 'Failed to start match' });
    }
  });

  socket.on('submit_roast', async ({ matchId, text }) => {
    try {
      const numericMatchId = Number(matchId);
      const battle = await battleService.submitRoast({
        user,
        matchId: numericMatchId,
        text,
      });
      io.to(`battle_${numericMatchId}`).emit('roast_submitted', {
        matchId: numericMatchId,
        battle,
      });
    } catch (error) {
      socket.emit('error_message', { message: error.message || 'Failed to submit roast' });
    }
  });

  socket.on('cast_vote', async ({ matchId, selectedPlayer }) => {
    try {
      const numericMatchId = Number(matchId);
      const battle = await battleService.castVote({
        user,
        matchId: numericMatchId,
        selectedPlayer,
      });
      io.to(`battle_${numericMatchId}`).emit('vote_update', {
        matchId: numericMatchId,
        votesPlayer1: battle.votesPlayer1,
        votesPlayer2: battle.votesPlayer2,
      });
    } catch (error) {
      socket.emit('error_message', { message: error.message || 'Failed to cast vote' });
    }
  });

  socket.on('place_prediction', async ({ matchId, selectedPlayer, amount }) => {
    try {
      await battleService.placePrediction({
        user,
        matchId: Number(matchId),
        selectedPlayer,
        amount,
      });
    } catch (error) {
      socket.emit('error_message', { message: error.message || 'Failed to place prediction' });
    }
  });

  socket.on('disconnect', async () => {
    const rooms = Array.from(joinedBattleRooms);
    for (const room of rooms) {
      const matchId = Number(room.replace('battle_', ''));
      if (Number.isFinite(matchId) && matchId > 0) {
        await emitSpectatorCount(io, matchId);
      }
    }
  });
}

module.exports = {
  registerBattleSocketHandlers,
};
