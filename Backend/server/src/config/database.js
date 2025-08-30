
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { MONGO_URI, NODE_ENV } = require("./environment");

mongoose.set("strictQuery", true); 


const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);                                                // Exit process if DB fails
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  logger.error(`MongoDB error: ${err}`);
});

if (NODE_ENV === "development") {
  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB reconnected");
  });
}

module.exports = connectDB;
