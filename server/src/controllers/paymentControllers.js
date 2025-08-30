const PaymentService = require('../services/paymentService');
const prisma = require('../db/prisma');

exports.initiatePayment = async (req, res, next) => {
  try {
    const { bookingId, provider = 'stripe' } = req.body;
    const userId = req.user.userId;

    // Validate booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: true,
        user: true
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized for this booking' });
    }

    if (booking.paymentStatus === 'SUCCESS') {
      return res.status(400).json({ message: 'Booking is already paid' });
    }

    // Initiate payment
    const paymentResult = await PaymentService.processPayment(
      bookingId,
      parseFloat(booking.total),
      provider
    );

    res.json({
      message: 'Payment initiated',
      clientSecret: paymentResult.clientSecret,
      paymentId: paymentResult.payment.id
    });

  } catch (err) {
    console.error('Initiate payment error:', err);
    res.status(500).json({ message: 'Failed to initiate payment' });
  }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    const result = await PaymentService.confirmPayment(paymentIntentId);

    if (result.success) {
      res.json({
        message: 'Payment confirmed successfully',
        payment: result.payment
      });
    } else {
      res.status(400).json({
        message: 'Payment confirmation failed',
        payment: result.payment
      });
    }

  } catch (err) {
    console.error('Confirm payment error:', err);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
};

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: true,
            event: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.booking.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }

    res.json(payment);

  } catch (err) {
    console.error('Get payment status error:', err);
    res.status(500).json({ message: 'Failed to get payment status' });
  }
};

exports.refundPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.user.userId;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            event: {
              select: {
                organizerId: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user is the event organizer
    if (payment.booking.event.organizerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to refund this payment' });
    }

    if (payment.status !== 'SUCCESS') {
      return res.status(400).json({ message: 'Payment is not successful, cannot refund' });
    }

    const refundResult = await PaymentService.refundPayment(id, amount);

    res.json({
      message: 'Refund processed successfully',
      refund: refundResult.refund,
      payment: refundResult.payment
    });

  } catch (err) {
    console.error('Refund payment error:', err);
    res.status(500).json({ message: 'Failed to process refund' });
  }
};

exports.getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (page - 1) * limit;
    const where = {
      booking: {
        userId
      }
    };

    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          booking: {
            include: {
              event: {
                select: {
                  id: true,
                  title: true,
                  startAt: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error('Get payment history error:', err);
    res.status(500).json({ message: 'Failed to get payment history' });
  }
};

// Webhook handler for Stripe
exports.handleStripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await PaymentService.confirmPayment(paymentIntent.id);
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await prisma.payment.updateMany({
          where: { transactionId: failedPayment.id },
          data: { 
            status: 'FAILED',
            failureReason: failedPayment.last_payment_error?.message
          }
        });
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });

  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ message: 'Webhook handler failed' });
  }
};