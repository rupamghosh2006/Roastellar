const express = require('express');
const walletController = require('./wallet.controller');
const { protect } = require('../../middlewares/clerk.middleware');

const router = express.Router();

router.post('/create', protect, walletController.createWallet);
router.get('/me', protect, walletController.getMyWallet);
router.post('/refund-test', protect, walletController.refundTestWallet);

module.exports = router;
