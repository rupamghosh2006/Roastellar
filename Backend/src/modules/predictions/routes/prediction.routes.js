const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/prediction.controller');
const { protect } = require('../../../middlewares/clerk.middleware');

router.post('/place/:matchId', protect, predictionController.place);
router.get('/:matchId', predictionController.getMatchPredictions);
router.get('/my/list', protect, predictionController.myPredictions);

module.exports = router;