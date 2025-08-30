const Stripe = require("stripe");
const { STRIPE_SECRET } = require("../config/environment");
const PaymentModel = require("../models/payment");
const BookingModel = require("../models/booking");

const stripe = Stripe(STRIPE_SECRET);

class PaymentService {
  static async processPayment(bookingId, amount, method = "card") {
    try {
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
      const payment = await PaymentModel.create({
        bookingId,
        amount,
        currency: "INR",
        provider: "stripe",
        status: "initiated",
        transactionId: paymentIntent.id,
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
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      const payment = await PaymentModel.findByTransactionId(paymentIntentId);
      if (!payment) {
        throw new Error("Payment record not found");
      }

      let status = "failed";
      if (paymentIntent.status === "succeeded") {
        status = "successful";
        
        // Update booking status to confirmed
        await BookingModel.update(payment.bookingId, {
          status: "confirmed",
        });
      }

      // Update payment status
      await PaymentModel.updateStatus(payment.id, status);

      return {
        success: status === "successful",
        payment: await PaymentModel.findById(payment.id),
        paymentIntent,
      };
    } catch (err) {
      console.error("Payment confirmation failed:", err);
      throw err;
    }
  }

  static async refundPayment(paymentId, amount = null) {
    try {
      const payment = await PaymentModel.findById(paymentId);
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
        await PaymentModel.updateStatus(payment.id, "refunded");
        
        // Update booking status to cancelled
        await BookingModel.update(payment.bookingId, {
          status: "cancelled",
        });
      }

      return {
        refund,
        payment: await PaymentModel.findById(payment.id),
      };
    } catch (err) {
      console.error("Payment refund failed:", err);
      throw err;
    }
  }

  static async getPaymentStatus(paymentId) {
    try {
      return await PaymentModel.findById(paymentId);
    } catch (err) {
      console.error("Failed to get payment status:", err);
      throw err;
    }
  }
}

module.exports = PaymentService;
