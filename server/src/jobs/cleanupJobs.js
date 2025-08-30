const cron = require("node-cron");
const Booking = require("../models/booking");
const logger = require("../utils/logger");

// Run daily at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    logger.info("🧹 Running cleanup job...");

    const result = await Booking.deleteMany({
      status: "pending",
      createdAt: { $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // older than 1 day
    });

    logger.info(`✅ Cleanup done. Removed ${result.deletedCount} expired bookings.`);
  } catch (err) {
    logger.error("❌ Cleanup job failed", { error: err.message });
  }
});
