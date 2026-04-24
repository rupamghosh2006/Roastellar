require('dotenv').config();

const battleService = require('../modules/battles/services/battle.service');

let io = null;

function userPayload(user) {
  return {
    id: String(user._id),
    clerkId: user.clerkId,
    username: user.username,
    avatar: user.avatar || user.imageUrl || '',
  };
}

const initializeSocket = (httpServer) => {
  const { Server } = require('socket.io');
  const { clerk } = require('./clerk');
  const User = require('../modules/users/models/user.model');
  const Battle = require('../modules/battles/models/battle.model');

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const claims = await clerk.verifyToken(token);
      if (!claims?.sub) {
        return next(new Error('Invalid token'));
      }

      const user = await User.findOne({ clerkId: claims.sub });
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;

    socket.on('join_lobby', async () => {
      socket.join('lobby');
      io.to('lobby').emit('open_battles_updated', await battleService.getOpenBattles());
    });

    socket.on('join_battle', async ({ matchId }) => {
      const room = `battle_${matchId}`;
      socket.join(room);
      const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
      await Battle.updateOne({ matchId: Number(matchId) }, { spectatorsCount: roomSize });
      io.to(room).emit('spectator_count', { matchId: Number(matchId), count: roomSize });
      io.to(room).emit('player_joined', {
        matchId: Number(matchId),
        user: userPayload(user),
      });
    });

    socket.on('leave_battle', ({ matchId }) => {
      const room = `battle_${matchId}`;
      socket.leave(room);
      const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
      Battle.updateOne({ matchId: Number(matchId) }, { spectatorsCount: roomSize }).catch(() => {});
      io.to(room).emit('spectator_count', { matchId: Number(matchId), count: roomSize });
    });

    socket.on('start_match', async ({ matchId }) => {
      try {
        const battle = await battleService.joinBattle({
          user,
          matchId: Number(matchId),
        });
        io.to(`battle_${matchId}`).emit('battle_started', {
          matchId: Number(matchId),
          battle,
        });
      } catch (error) {
        socket.emit('error_message', { message: error.message || 'Failed to start match' });
      }
    });

    socket.on('submit_roast', async ({ matchId, text }) => {
      try {
        const battle = await battleService.submitRoast({
          user,
          matchId: Number(matchId),
          text,
        });
        io.to(`battle_${matchId}`).emit('roast_submitted', {
          matchId: Number(matchId),
          battle,
        });
      } catch (error) {
        socket.emit('error_message', { message: error.message || 'Failed to submit roast' });
      }
    });

    socket.on('cast_vote', async ({ matchId, selectedPlayer }) => {
      try {
        const battle = await battleService.castVote({
          user,
          matchId: Number(matchId),
          selectedPlayer,
        });
        io.to(`battle_${matchId}`).emit('vote_update', {
          matchId: Number(matchId),
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

    socket.on('disconnect', () => {});
  });

  return io;
};

const getIO = () => io;

module.exports = {
  initializeSocket,
  getIO,
};
