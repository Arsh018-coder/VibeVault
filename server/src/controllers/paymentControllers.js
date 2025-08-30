const Payment = require('../models/payment');
const paymentService = require('../services/paymentService');

exports.initiatePayment = async (req, res, next) => {
  try {
    const { amount, bookingId, method } = req.body;

    // Process payment via your service
    const paymentIntent = await paymentService.processPayment(amount, method);

    // Create payment record in PostgreSQL
    const payment = await Payment.create({
      bookingId,          // Sequelize foreign key
      userId: req.user.id, // Sequelize foreign key
      amount,
      method,
      status: 'pending'
    });

    res.status(201).json({ payment, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};
