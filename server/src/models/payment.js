const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2), // better for currency than INTEGER
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "INR",
    },
    provider: {
      type: DataTypes.ENUM("stripe", "paypal"),
      defaultValue: "stripe",
    },
    status: {
      type: DataTypes.ENUM("initiated", "successful", "failed"),
      defaultValue: "initiated",
    },
    transactionId: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Associations
Payment.associate = (models) => {
  // A payment belongs to one booking
  Payment.belongsTo(models.Booking, { foreignKey: "bookingId" });
};

module.exports = Payment;
