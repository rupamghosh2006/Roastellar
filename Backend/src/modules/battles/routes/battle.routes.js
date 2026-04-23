const express = require('express');
const router = express.Router();
const battleController = require('../../battles/controllers/battle.controller');
const { protect } = require('../../../middlewares/clerk.middleware');

router.post('/create', protect, battleController.create);
router.post('/join/:matchId', protect, battleController.join);
router.post('/submit-roast/:matchId', protect, battleController.submitRoast);
router.post('/vote/:matchId', protect, battleController.vote);
router.post('/finalize/:matchId', protect, battleController.finalize);
router.get('/open', battleController.getOpenMatches);
router.get('/:matchId', battleController.getMatch);

module.exports = router;