require('dotenv').config();

let io = null;

const initializeSocket = (httpServer) => {
  const { Server } = require('socket.io');
  
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const { clerk } = require('./config/clerk');
      const claims = await clerk.verifyToken(token);
      
      if (!claims || !claims.sub) {
        return next(new Error('Invalid token'));
      }

      const { User } = require('./modules/users/models/user.model');
      const user = await User.findOne({ clerkId: claims.sub });

      if (!user) {
        return next(new Error('User not found'));
      }

      if (user.isBanned) {
        return next(new Error('Account banned'));
      }

      socket.data.user = user;
      socket.data.claims = claims;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`User connected: ${user.username} (${socket.id})`);

    socket.on('join_lobby', () => {
      socket.join('lobby');
      io.emit('users_online', { count: io.sockets.size });
    });

    socket.on('leave_lobby', () => {
      socket.leave('lobby');
    });

    socket.on('join_match', (data) => {
      const { matchId } = data;
      socket.join(`match_${matchId}`);
      socket.data.currentRoom = `match_${matchId}`;
      
      socket.to(`match_${matchId}`).emit('player_joined', {
        user: user.toPublicJSON(),
        matchId,
      });
    });

    socket.on('leave_match', (data) => {
      const { matchId } = data;
      socket.leave(`match_${matchId}`);
      
      if (socket.data.currentRoom === `match_${matchId}`) {
        socket.to(`match_${matchId}`).emit('player_left', {
          user: user.toPublicJSON(),
          matchId,
        });
        socket.data.currentRoom = null;
      }
    });

    socket.on('submit_roast', (data) => {
      const { matchId, roastCid } = data;
      
      io.to(`match_${matchId}`).emit('roast_submitted', {
        user: user.toPublicJSON(),
        matchId,
        roastCid,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('cast_vote', (data) => {
      const { matchId, selectedPlayer } = data;
      
      io.to(`match_${matchId}`).emit('vote_cast', {
        user: user.toPublicJSON(),
        matchId,
        selectedPlayer,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('place_prediction', (data) => {
      const { matchId, selectedPlayer, amount } = data;
      
      io.to(`match_${matchId}`).emit('prediction_placed', {
        user: user.toPublicJSON(),
        matchId,
        selectedPlayer,
        amount,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('start_match', (data) => {
      const { matchId } = data;
      
      io.to(`match_${matchId}`).emit('match_started', {
        matchId,
        startedAt: new Date().toISOString(),
      });
    });

    socket.on('typing', (data) => {
      const { matchId } = data;
      
      socket.to(`match_${matchId}`).emit('user_typing', {
        user: user.toPublicJSON(),
        matchId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.username} (${socket.id})`);
      
      if (socket.data.currentRoom) {
        io.to(socket.data.currentRoom).emit('player_left', {
          user: user.toPublicJSON(),
          matchId: socket.data.currentRoom.replace('match_', ''),
        });
      }
      
      io.emit('users_online', { count: io.sockets.size - 1 });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('Socket.io initialized with Clerk auth');
  return io;
};

const getIO = () => io;

const emitToLobby = (event, data) => {
  if (io) io.to('lobby').emit(event, data);
};

const emitToMatch = (matchId, event, data) => {
  if (io) io.to(`match_${matchId}`).emit(event, data);
};

const emitToUser = (userId, event, data) => {
  if (io && io.sockets) {
    for (const socket of io.sockets.sockets.values()) {
      if (socket.data.user?._id?.toString() === userId.toString()) {
        socket.emit(event, data);
      }
    }
  }
};

const broadcastBattleUpdate = (battle) => {
  if (io) {
    io.to('lobby').emit('battle_updated', battle);
    io.to(`match_${battle.matchId}`).emit('battle_state', battle);
  }
};

const broadcastLeaderboard = async () => {
  if (!io) return;
  
  const { User } = require('./modules/users/models/user.model');
  const leaderboard = await User.find({ isBanned: false })
    .sort({ xp: -1 })
    .limit(10)
    .select('username imageUrl xp wins')
    .lean();

  io.to('lobby').emit('leaderboard', leaderboard);
};

module.exports = {
  initializeSocket,
  getIO,
  emitToLobby,
  emitToMatch,
  emitToUser,
  broadcastBattleUpdate,
  broadcastLeaderboard,
};