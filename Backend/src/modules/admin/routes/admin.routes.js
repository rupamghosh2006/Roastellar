const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, requireAdmin } = require('../../middlewares/auth.middleware');

router.get('/metrics', protect, requireAdmin, adminController.getMetrics);
router.get('/users', protect, requireAdmin, adminController.getAllUsers);
router.get('/battles', protect, requireAdmin, adminController.getAllBattles);
router.patch('/ban/:userId', protect, requireAdmin, adminController.banUser);
router.patch('/unban/:userId', protect, requireAdmin, adminController.unbanUser);

module.exports = router;