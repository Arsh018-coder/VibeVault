<<<<<<< HEAD
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
=======
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Ticket = sequelize.define(
  "Ticket",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM("regular", "vip", "early-bird"),
      defaultValue: "regular",
    },
    price: {
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

// Associations
Ticket.associate = (models) => {
  // A Ticket belongs to one Event
  Ticket.belongsTo(models.Event, { foreignKey: "eventId", onDelete: "CASCADE" });

  // A Ticket can appear in many Bookings through a join table
  Ticket.belongsToMany(models.Booking, {
    through: "BookingTickets", // join table
    foreignKey: "ticketId",
    otherKey: "bookingId",
  });
};

module.exports = Ticket;
>>>>>>> 695296bbcba2ae68b159ad7a57337e4b14d04b29
