const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentControllers');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

router.post('/initiate', validate('initiatePayment'), paymentController.initiatePayment);
router.post('/confirm', validate('confirmPayment'), paymentController.confirmPayment);
router.get('/history', paymentController.getPaymentHistory);
router.get('/booking/:bookingId', paymentController.getBookingPayments);
router.post('/refund/:paymentId', paymentController.refundPayment);

module.exports = router;