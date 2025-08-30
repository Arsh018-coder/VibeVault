// server/src/services/paymentService.js
const Stripe = require("stripe");
const { STRIPE_SECRET } = require("../config/environment");

const stripe = Stripe(STRIPE_SECRET);

exports.processPayment = async (amount, method) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency: "inr", 
      payment_method_types: ["card", "upi"], 
    });
    return paymentIntent;
  } catch (err) {
    console.error("Payment failed:", err);
    throw err;
  }
};
