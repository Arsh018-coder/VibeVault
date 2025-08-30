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
