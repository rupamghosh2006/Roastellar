const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const predictionController = require('../controllers/prediction.controller');
const { protect } = require('../../../middlewares/clerk.middleware');
const ApiResponse = require('../../../utils/apiResponse');

const predictionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.PREDICTION_RATE_LIMIT || 20),
  message: { success: false, message: 'Too many prediction attempts. Please wait a moment.' },
});

const placePredictionSchema = z.object({
  selectedPlayer: z.string().min(1),
  amount: z.number().positive(),
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

router.post('/place/:matchId', predictionLimiter, protect, validateBody(placePredictionSchema), predictionController.place);
router.get('/:matchId', predictionController.getMatchPredictions);

module.exports = router;
