
const Stripe = require("stripe");
const { STRIPE_SECRET_KEY } = require("../config/environment");
const logger = require("../utils/logger");

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16", 
});


const createPaymentIntent = async (amount, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), 
      currency: "inr",
      metadata,
    });
    return paymentIntent;
  } catch (err) {
    logger.error(`Stripe Payment Error: ${err.message}`);
    throw new Error("Payment initialization failed");
  }
};


const verifyWebhook = (rawBody, sig, webhookSecret) => {
  try {
    return stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    throw new Error("Invalid webhook signature");
  }
};

module.exports = {
  createPaymentIntent,
  verifyWebhook,
};