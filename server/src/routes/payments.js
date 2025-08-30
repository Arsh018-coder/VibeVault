const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentControllers');
const auth = require('../middleware/auth');

router.post('/initiate', auth, paymentController.initiatePayment);     // Initiate payment
router.post('/confirm', auth, paymentController.confirmPayment);       // Confirm payment
router.get('/history', auth, paymentController.getPaymentHistory);     // Get payment history

module.exports = router;