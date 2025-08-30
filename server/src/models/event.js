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
