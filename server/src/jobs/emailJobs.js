
const cron = require("node-cron");
const User = require("../models/user");
const emailService = require("../services/emailService");
const logger = require("../utils/logger");


cron.schedule("0 10 * * MON", async () => {
  try {
    logger.info("Running weekly email job...");

    const users = await User.find();

    for (const user of users) {
      await emailService.sendEmail(
        user.email,
        " Weekly Event Highlights",
        "Check out the hottest events this week!",
        "<h1> Weekly Event Highlights</h1><p>Don’t miss out!</p>"
      );
    }

    logger.info("Weekly emails sent.");
  } catch (err) {
    logger.error("Email job failed", { error: err.message });
  }
});
