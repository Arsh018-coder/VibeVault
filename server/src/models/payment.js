<<<<<<< HEAD
const prisma = require("../db/prisma");

class PaymentModel {
  static async create(paymentData) {
    return prisma.payment.create({
      data: paymentData,
      include: {
        booking: {
          include: {
            user: true,
            event: true,
          },
        },
      },
    });
  }

  static async findById(id) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: true,
            event: true,
          },
        },
      },
    });
  }

  static async findAll(options = {}) {
    return prisma.payment.findMany({
      ...options,
      include: {
        booking: {
          include: {
            user: true,
            event: true,
          },
        },
        ...options.include,
      },
    });
  }

  static async update(id, paymentData) {
    return prisma.payment.update({
      where: { id },
      data: paymentData,
      include: {
        booking: {
          include: {
            user: true,
            event: true,
          },
        },
      },
    });
  }

  static async delete(id) {
    return prisma.payment.delete({
      where: { id },
    });
  }

  static async findByBooking(bookingId) {
    return prisma.payment.findMany({
      where: { bookingId },
      include: {
        booking: true,
      },
    });
  }

  static async findByTransactionId(transactionId) {
    return prisma.payment.findFirst({
      where: { transactionId },
      include: {
        booking: {
          include: {
            user: true,
            event: true,
          },
        },
      },
    });
  }

  static async updateStatus(id, status, transactionId = null) {
    const updateData = { status };
    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    return prisma.payment.update({
      where: { id },
      data: updateData,
    });
  }
}

module.exports = PaymentModel;
=======
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
>>>>>>> 695296bbcba2ae68b159ad7a57337e4b14d04b29
