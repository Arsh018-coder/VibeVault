const prisma = require("../db/prisma");

class BookingModel {
  static async create(bookingData) {
    return prisma.booking.create({
      data: bookingData,
      include: {
        user: true,
        event: true,
        tickets: {
          include: {
            ticket: true,
          },
        },
        payment: true,
      },
    });
  }

  static async findById(id) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        event: true,
        tickets: {
          include: {
            ticket: true,
          },
        },
        payment: true,
      },
    });
  }

  static async findAll(options = {}) {
    return prisma.booking.findMany({
      ...options,
      include: {
        user: true,
        event: true,
        tickets: {
          include: {
            ticket: true,
          },
        },
        payment: true,
        ...options.include,
      },
    });
  }

  static async update(id, bookingData) {
    return prisma.booking.update({
      where: { id },
      data: bookingData,
      include: {
        user: true,
        event: true,
        tickets: {
          include: {
            ticket: true,
          },
        },
        payment: true,
      },
    });
  }

  static async delete(id) {
    return prisma.booking.delete({
      where: { id },
    });
  }

  static async findByUser(userId) {
    return prisma.booking.findMany({
      where: { userId },
      include: {
        event: true,
        tickets: {
          include: {
            ticket: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async findByEvent(eventId) {
    return prisma.booking.findMany({
      where: { eventId },
      include: {
        user: true,
        tickets: {
          include: {
            ticket: true,
          },
        },
        payment: true,
      },
    });
  }
}

module.exports = BookingModel;