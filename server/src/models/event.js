<<<<<<< HEAD
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
=======
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Event = sequelize.define(
  "Event",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    banner: {
      type: DataTypes.STRING, // Cloudinary image URL
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Associations
Event.associate = (models) => {
  // An Event belongs to one Organizer (User)
  Event.belongsTo(models.User, { foreignKey: "organizerId", as: "organizer" });

  // An Event has many Tickets
  Event.hasMany(models.Ticket, { foreignKey: "eventId", as: "tickets" });

  // An Event can have many Bookings
  Event.hasMany(models.Booking, { foreignKey: "eventId" });
};

module.exports = Event;
>>>>>>> 695296bbcba2ae68b159ad7a57337e4b14d04b29
