const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../../../middlewares/clerk.middleware');

router.get('/me', protect, userController.getMe);
router.patch('/me', protect, userController.updateProfile);
router.get('/leaderboard', userController.getLeaderboard);
router.get('/:userId', userController.getUserById);

module.exports = router;