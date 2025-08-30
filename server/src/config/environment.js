require("dotenv").config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,

  // Database 
  PG_URI: process.env.PG_URI || "postgres://username:password@localhost:5432/event_app",

  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || "supersecret",

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

  // Payments
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || "",
  PAYPAL_SECRET: process.env.PAYPAL_SECRET || "",

  // Services
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",
  SMS_API_KEY: process.env.SMS_API_KEY || "",
  WHATSAPP_API_KEY: process.env.WHATSAPP_API_KEY || "",
};
