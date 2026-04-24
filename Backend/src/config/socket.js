require('dotenv').config();

const { registerBattleSocketHandlers } = require('../sockets/battle.socket');

let io = null;

function getAllowedOrigins() {
  const raw = process.env.CLIENT_URL || process.env.CLIENT_ORIGINS || '';
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin, allowedOrigins) {
  if (!origin) return true;
  if (allowedOrigins.length === 0) return true;
  return allowedOrigins.includes(origin);
}

const initializeSocket = (httpServer) => {
  const { Server } = require('socket.io');
  const { clerk } = require('./clerk');
  const User = require('../modules/users/models/user.model');

  const allowedOrigins = getAllowedOrigins();
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isOriginAllowed(origin, allowedOrigins)) {
          return callback(null, true);
        }
        return callback(new Error('Socket CORS blocked'));
      },
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

      const claims = await clerk.verifyToken(token, {
        origin: socket.handshake.headers.origin,
        referer: socket.handshake.headers.referer,
        host: socket.handshake.headers.host,
      });
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
