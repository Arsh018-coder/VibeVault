const Payment = require('../models/payment');
const paymentService = require('../services/paymentService');

exports.initiatePayment = async (req, res, next) => {
  try {
    const { amount, bookingId, method } = req.body;
    const paymentIntent = await paymentService.processPayment(amount, method);

    const payment = await Payment.create({
      booking: bookingId,
      user: req.user.id,
      amount,
      method,
      status: 'pending'
    });

    res.status(201).json({ payment, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};