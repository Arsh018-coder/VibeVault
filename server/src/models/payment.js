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
