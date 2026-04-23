const jwt = require('jsonwebtoken');
const authService = require('../modules/auth/services/auth.service');
const battleService = require('../modules/battles/services/battle.service');
const UserService = require('../modules/users/services/user.service');
const logger = require('../utils/logger');

module.exports = (io, socket) => {
  let currentUser = null;
  let currentRoom = null;

  socket.on('authenticate', async (data, callback) => {
    try {
      const { token } = data;
      if (!token) {
        return callback({ error: 'No token provided' });
      }

      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      currentUser = await authService.getUserByFirebaseUid(decoded.uid);

      if (!currentUser) {
        return callback({ error: 'User not found' });
      }

      socket.data.user = currentUser;
      socket.join('lobby');

      io.emit('users_online', { count: io.sockets.size });

      callback({ success: true, user: currentUser.toPublicJSON() });
    } catch (error) {
      logger.error('Socket auth error:', error);
      callback({ error: error.message });
    }
  });

  socket.on('join_lobby', async (data, callback) => {
    try {
      if (currentRoom) {
        socket.leave(currentRoom);
      }
      socket.join('lobby');
      currentRoom = 'lobby';

      const leaderboard = await UserService.getLeaderboard();
      io.emit('leaderboard_updated', leaderboard);

      callback({ success: true });
    } catch (error) {
      logger.error('Join lobby error:', error);
      callback({ error: error.message });
    }
  });

  socket.on('join_match', async (data, callback) => {
    try {
      const { matchId } = data;
      const battle = await battleService.getMatch(matchId);

      if (!battle) {
        return callback({ error: 'Match not found' });
      }

      if (currentRoom && currentRoom !== 'lobby') {
        socket.leave(currentRoom);
      }

      socket.join(`match_${matchId}`);
      currentRoom = `match_${matchId}`;

      io.to(`match_${matchId}`).emit('match_joined', {
        matchId,
        user: currentUser?.toPublicJSON(),
      });

      callback({ success: true, battle: battle.toJSON() });
    } catch (error) {
      logger.error('Join match error:', error);
      callback({ error: error.message });
    }
  });

  socket.on('leave_match', async (data, callback) => {
    try {
      const { matchId } = data;
      socket.leave(`match_${matchId}`);
      currentRoom = currentRoom === `match_${matchId}` ? 'lobby' : currentRoom;

      callback({ success: true });
    } catch (error) {
      logger.error('Leave match error:', error);
      callback({ error: error.message });
    }
  });

  socket.on('submit_roast', async (data, callback) => {
    try {
      const { matchId, roastCid } = data;

      if (!currentUser) {
        return callback({ error: 'Not authenticated' });
      }

      await battleService.submitRoast(matchId, currentUser._id, roastCid);

      callback({ success: true });
    } catch (error) {
      logger.error('Submit roast error:', error);
      callback({ error: error.message });
    }
  });

  socket.on('cast_vote', async (data, callback) => {
    try {
      const { matchId, selectedPlayer } = data;

      if (!currentUser) {
        return callback({ error: 'Not authenticated' });
      }

      await battleService.vote(matchId, currentUser._id, selectedPlayer);

      callback({ success: true });
    } catch (error) {
      logger.error('Cast vote error:', error);
      callback({ error: error.message });
    }
  });

  socket.on('place_prediction', async (data, callback) => {
    try {
      const { matchId, selectedPlayer, amount } = data;

      if (!currentUser) {
        return callback({ error: 'Not authenticated' });
      }

      await PredictionService.place(currentUser._id, matchId, selectedPlayer, amount);

      callback({ success: true });
    } catch (error) {
      logger.error('Place prediction error:', error);
      callback({ error: error.message });
    }
  });

  socket.on('start_match', async (data, callback) => {
    try {
      const { matchId } = data;
      const battle = await battleService.finalize(matchId);

      io.to(`match_${matchId}`).emit('battle_result', {
        matchId,
        status: battle.status,
        winner: battle.winner?.toString(),
      });

      callback({ success: true });
    } catch (error) {
      logger.error('Start match error:', error);
      callback({ error: error.message });
    }
  });

  socket.on('disconnect', () => {
    if (currentRoom && currentRoom !== 'lobby') {
      io.to(currentRoom).emit('user_left', {
        user: currentUser?.toPublicJSON(),
      });
    }
    io.emit('users_online', { count: io.sockets.size - 1 });
  });
};

const PredictionService = require('../modules/predictions/services/prediction.service');