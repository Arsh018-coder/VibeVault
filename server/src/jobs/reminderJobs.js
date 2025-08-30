const cron = require("node-cron");
const Event = require("../models/event");
const Booking = require("../models/booking");
const notificationService = require("../services/notificationService");
const dateUtils = require("../utils/dateUtils");
const logger = require("../utils/logger");


cron.schedule("0 9 * * *", async () => {
  try {
    logger.info("Running reminder job...");

    const upcomingEvents = await Event.find({
      date: { $gte: new Date(), $lte: dateUtils.addDays(new Date(), 1) }, // Events in next 24h
    });

    for (const event of upcomingEvents) {
      const bookings = await Booking.find({ event: event._id }).populate("user");

      for (const booking of bookings) {
        await notificationService.send(
          booking.user,
          `Reminder: Your event "${event.title}" is happening on ${dateUtils.formatDate(event.date)}`,
          "email"
        );
      }
    }

    logger.info("Reminder job finished.");
  } catch (err) {
    logger.error("Reminder job failed", { error: err.message });
  }
});
