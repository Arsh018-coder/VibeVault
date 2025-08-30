const { Sequelize } = require("sequelize");
const logger = require("../utils/logger");
const { PG_URI, NODE_ENV } = require("./environment");

// Sequelize instance
const sequelize = new Sequelize(PG_URI, {
  dialect: "postgres",
  logging: NODE_ENV === "development" ? console.log : false, // Show SQL logs in dev
});


const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info("PostgreSQL connected successfully");
  } catch (err) {
    logger.error(`PostgreSQL connection error: ${err.message}`);
    process.exit(1); // Exit process if DB fails
  }
};


if (NODE_ENV === "development") {
  sequelize.afterConnect(() => {
    logger.info("PostgreSQL connection established");
  });

  sequelize.afterDisconnect(() => {
    logger.warn("PostgreSQL connection lost");
  });
}

module.exports = { sequelize, connectDB };
