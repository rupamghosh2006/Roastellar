const express = require('express');
const leaderboardController = require('../controllers/leaderboard.controller');

const router = express.Router();

router.get('/', leaderboardController.getLeaderboard);

module.exports = router;
