const express = require('express');
const analyticsController = require('../controllers/analytics.controller');

const router = express.Router();

router.get('/metrics', analyticsController.getPublicMetrics);

module.exports = router;
