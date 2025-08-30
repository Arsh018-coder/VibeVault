const prisma = require("../db/prisma");

class EventModel {
  static async create(eventData) {
    return prisma.event.create({
      data: eventData,
      include: {
        organizer: true,
        tickets: true,
      },
    });
  }

  static async findById(id) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        organizer: true,
        tickets: true,
        bookings: true,
      },
    });
  }

  static async findAll(options = {}) {
    return prisma.event.findMany({
      ...options,
      include: {
        organizer: true,
        tickets: true,
        ...options.include,
      },
    });
  }

  static async update(id, eventData) {
    return prisma.event.update({
      where: { id },
      data: eventData,
      include: {
        organizer: true,
        tickets: true,
      },
    });
  }

  static async delete(id) {
    return prisma.event.delete({
      where: { id },
    });
  }

  static async findByOrganizer(organizerId) {
    return prisma.event.findMany({
      where: { organizerId },
      include: {
        tickets: true,
        bookings: true,
      },
    });
  }

  static async findUpcoming() {
    return prisma.event.findMany({
      where: {
        date: {
          gte: new Date(),
        },
      },
      include: {
        organizer: true,
        tickets: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}

module.exports = EventModel;
