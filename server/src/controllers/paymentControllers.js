const prisma = require('../db/prisma');

exports.initiatePayment = async (req, res, next) => {
  try {
    const { bookingId, provider = 'stripe' } = req.body;
    const userId = req.user.userId;

    // Get booking details
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId
      },
      include: {
        event: {
          select: {
            title: true,
            startAt: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentStatus !== 'PENDING') {
      return res.status(400).json({ message: 'Payment already processed' });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: booking.total,
        currency: booking.currency,
        provider,
        status: 'PENDING',
        metadata: {
          eventTitle: booking.event.title,
          eventDate: booking.event.startAt
        }
      }
    });

    // In a real implementation, you would integrate with Stripe/Razorpay here
    // For demo purposes, we'll simulate payment processing
    const mockPaymentIntent = {
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: booking.total * 100, // Convert to smallest currency unit
      currency: booking.currency.toLowerCase()
    };

    res.status(201).json({
      message: 'Payment initiated',
      payment,
      paymentIntent: mockPaymentIntent
    });
  } catch (err) {
    console.error('Initiate payment error:', err);
    next(err);
  }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentId, providerTxnId } = req.body;

    // Update payment status
    const payment = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'SUCCESS',
          providerTxnId,
          paidAt: new Date()
        }
      });

      // Update booking status
      await tx.booking.update({
        where: { id: updatedPayment.bookingId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'SUCCESS'
        }
      });

      return updatedPayment;
    });

    res.json({
      message: 'Payment confirmed successfully',
      payment
    });
  } catch (err) {
    console.error('Confirm payment error:', err);
    next(err);
  }
};

exports.getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: {
          booking: {
            userId
          }
        },
        skip,
        take: parseInt(limit),
        include: {
          booking: {
            include: {
              event: {
                select: {
                  title: true,
                  startAt: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.count({
        where: {
          booking: {
            userId
          }
        }
      })
    ]);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get payment history error:', err);
    next(err);
  }
};