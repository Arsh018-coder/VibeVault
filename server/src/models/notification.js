const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("email", "sms", "whatsapp", "system"),
      defaultValue: "system",
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Associations
Notification.associate = (models) => {
  // A notification belongs to a user
  Notification.belongsTo(models.User, { foreignKey: "userId" });
};

module.exports = Notification;
