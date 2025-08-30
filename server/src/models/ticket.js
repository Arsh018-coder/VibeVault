const prisma = require("../db/prisma");

class TicketModel {
  static async create(ticketData) {
    return prisma.ticket.create({
      data: ticketData,
      include: {
        event: true,
      },
    });
  }

  static async findById(id) {
    return prisma.ticket.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });
  }

  static async findAll(options = {}) {
    return prisma.ticket.findMany({
      ...options,
      include: {
        event: true,
        ...options.include,
      },
    });
  }

  static async update(id, ticketData) {
    return prisma.ticket.update({
      where: { id },
      data: ticketData,
      include: {
        event: true,
      },
    });
  }

  static async delete(id) {
    return prisma.ticket.delete({
      where: { id },
    });
  }

  static async findByEvent(eventId) {
    return prisma.ticket.findMany({
      where: { eventId },
      include: {
        event: true,
      },
    });
  }

  static async updateSoldCount(id, quantity) {
    return prisma.ticket.update({
      where: { id },
      data: {
        sold: {
          increment: quantity,
        },
      },
    });
  }

  static async checkAvailability(id, requestedQuantity) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });
    
    if (!ticket) return false;
    return (ticket.quantity - ticket.sold) >= requestedQuantity;
  }
}

module.exports = TicketModel;
