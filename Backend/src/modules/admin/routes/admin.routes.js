const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const adminController = require('../controllers/admin.controller');
const { protect, requireAdmin } = require('../../../middlewares/clerk.middleware');

const adminLimiter = rateLimit({
  windowMs: Number(process.env.ADMIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.ADMIN_RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many admin requests, please try again later' },
});

router.use(adminLimiter);
router.get('/metrics', protect, requireAdmin, adminController.getMetrics);
router.get('/users', protect, requireAdmin, adminController.getAllUsers);
router.get('/battles', protect, requireAdmin, adminController.getAllBattles);
router.patch('/ban/:userId', protect, requireAdmin, adminController.banUser);
router.patch('/unban/:userId', protect, requireAdmin, adminController.unbanUser);

module.exports = router;
