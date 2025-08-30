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
