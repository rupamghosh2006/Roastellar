require('dotenv').config();

const { registerBattleSocketHandlers } = require('../sockets/battle.socket');

let io = null;

const initializeSocket = (httpServer) => {
  const { Server } = require('socket.io');
  const { clerk } = require('./clerk');
  const User = require('../modules/users/models/user.model');

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
    registerBattleSocketHandlers(io, socket);
  });

  return io;
};

const getIO = () => io;

module.exports = {
  initializeSocket,
  getIO,
};
