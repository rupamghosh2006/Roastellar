const express = require('express');
const router = express.Router();
const predictionController = require('../../predictions/controllers/prediction.controller');

router.post('/ipfs', predictionController.upload);

module.exports = router;