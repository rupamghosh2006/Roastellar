require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { errorHandler, notFound } = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

const userRoutes = require('./modules/users/routes/user.routes');
const battleRoutes = require('./modules/battles/routes/battle.routes');
const predictionRoutes = require('./modules/predictions/routes/prediction.routes');
const leaderboardRoutes = require('./modules/leaderboard/routes/leaderboard.routes');
const clerkRoutes = require('./modules/auth/routes/clerk.routes');
const walletRoutes = require('./modules/wallet/wallet.routes');

const app = express();
app.set('trust proxy', 1);

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

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = getAllowedOrigins();
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin, allowedOrigins)) {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked for this origin'));
  },
  credentials: true,
}));

app.use(morgan('dev'));

// Clerk webhook needs the raw request body for Svix signature verification.
app.use('/api/clerk', clerkRoutes);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, message: 'Too many requests, please try again later' },
});

app.use('/api', limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/users', userRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/wallet', walletRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
