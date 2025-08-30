<<<<<<< HEAD
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
=======
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Booking = sequelize.define("Booking", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  status: {
    type: DataTypes.ENUM("pending", "confirmed", "cancelled"),
    defaultValue: "pending",
  }
}, {
  timestamps: true, // createdAt, updatedAt
});

// Associations (define later in index.js or model init)
Booking.associate = (models) => {
  // A booking belongs to one user
  Booking.belongsTo(models.User, { foreignKey: "userId" });

  // A booking belongs to one event
  Booking.belongsTo(models.Event, { foreignKey: "eventId" });

  // A booking may belong to one payment
  Booking.belongsTo(models.Payment, { foreignKey: "paymentId" });

  // Many-to-Many relation: Booking <-> Ticket (with quantity in join table)
  Booking.belongsToMany(models.Ticket, {
    through: models.BookingTicket,
    foreignKey: "bookingId",
    otherKey: "ticketId",
  });
};

module.exports = Booking;
>>>>>>> 695296bbcba2ae68b159ad7a57337e4b14d04b29
