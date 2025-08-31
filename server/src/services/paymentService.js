const Stripe = require("stripe");
const prisma = require("../db/prisma");

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

class PaymentService {
  static async processPayment(bookingId, amount, method = "card") {
    try {
      if (!stripe) {
        throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.");
      }
      
      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to paise
        currency: "inr",
        payment_method_types: ["card", "upi"],
        metadata: {
          bookingId: bookingId.toString(),
        },
      });

      // Create payment record in database
      const payment = await prisma.payment.create({
        data: {
          bookingId,
          amount,
          currency: "INR",
          provider: "STRIPE",
          status: "PENDING",
          transactionId: paymentIntent.id,
        }
      });

      return {
        paymentIntent,
        payment,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (err) {
      console.error("Payment processing failed:", err);
      throw err;
    }
  }

  static async confirmPayment(paymentIntentId) {
    try {
      if (!stripe) {
        throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.");
      }
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      const payment = await prisma.payment.findFirst({
        where: { transactionId: paymentIntentId }
      });
      
      if (!payment) {
        throw new Error("Payment record not found");
      }

      let status = "FAILED";
      if (paymentIntent.status === "succeeded") {
        status = "SUCCESS";
        
        // Update booking status to confirmed
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { 
            status: "CONFIRMED",
            paymentStatus: "SUCCESS"
          }
        });
      }

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: { status }
      });

      return {
        success: status === "SUCCESS",
        payment: updatedPayment,
        paymentIntent,
      };
    } catch (err) {
      console.error("Payment confirmation failed:", err);
      throw err;
    }
  }

  static async refundPayment(paymentId, amount = null) {
    try {
      if (!stripe) {
        throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.");
      }
      
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });
      
      if (!payment) {
        throw new Error("Payment not found");
      }

      const refundAmount = amount || payment.amount;
      
      const refund = await stripe.refunds.create({
        payment_intent: payment.transactionId,
        amount: refundAmount * 100, // Convert to paise
      });

      // Update payment status if full refund
      if (!amount || amount === payment.amount) {
        const updatedPayment = await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "REFUNDED" }
        });
        
        // Update booking status to cancelled
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { 
            status: "CANCELLED",
            paymentStatus: "REFUNDED"
          }
        });

        return {
          refund,
          payment: updatedPayment,
        };
      }

      return {
        refund,
        payment,
      };
    } catch (err) {
      console.error("Payment refund failed:", err);
      throw err;
    }
  }

  static async getPaymentStatus(paymentId) {
    try {
      return await prisma.payment.findUnique({
        where: { id: paymentId }
      });
    } catch (err) {
      console.error("Failed to get payment status:", err);
      throw err;
    }
  }
}

module.exports = PaymentService;
