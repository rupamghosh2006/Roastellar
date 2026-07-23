const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../../auth/controllers/auth.controller');
const { protect } = require('../../../middlewares/auth.middleware');

const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later' },
});

router.post('/login', authLimiter, authController.login);
router.get('/me', authLimiter, protect, authController.getMe);

module.exports = router;
