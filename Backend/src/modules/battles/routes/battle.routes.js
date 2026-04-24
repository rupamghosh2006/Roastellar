const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const battleController = require('../../battles/controllers/battle.controller');
const { protect } = require('../../../middlewares/clerk.middleware');
const ApiResponse = require('../../../utils/apiResponse');

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.BATTLE_WRITE_RATE_LIMIT || 30),
  message: { success: false, message: 'Too many battle actions. Please slow down.' },
});

const createSchema = z.object({
  topic: z.string().trim().min(3).max(120),
  entryFee: z.number().positive(),
});

const roastSchema = z.object({
  text: z.string().trim().min(3).max(500),
});

const voteSchema = z.object({
  selectedPlayer: z.string().min(1),
});

function validateBody(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body || {});
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Invalid request body';
      return ApiResponse.badRequest(res, message);
    }
    req.body = parsed.data;
    return next();
  };
}

router.post('/create', writeLimiter, protect, validateBody(createSchema), battleController.create);
router.post('/join/:matchId', writeLimiter, protect, battleController.join);
router.post('/submit-roast/:matchId', writeLimiter, protect, validateBody(roastSchema), battleController.submitRoast);
router.post('/vote/:matchId', writeLimiter, protect, validateBody(voteSchema), battleController.vote);
router.post('/finalize/:matchId', writeLimiter, protect, battleController.finalize);
router.post('/cancel/:matchId', writeLimiter, protect, battleController.cancel);
router.get('/open', battleController.getOpenMatches);
router.get('/:matchId', battleController.getMatch);

module.exports = router;
