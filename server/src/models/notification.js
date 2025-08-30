<<<<<<< HEAD
const prisma = require("../db/prisma");

class NotificationModel {
  static async create(notificationData) {
    return prisma.notification.create({
      data: notificationData,
      include: {
        user: true,
      },
    });
  }

  static async findById(id) {
    return prisma.notification.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  static async findAll(options = {}) {
    return prisma.notification.findMany({
      ...options,
      include: {
        user: true,
        ...options.include,
      },
    });
  }

  static async update(id, notificationData) {
    return prisma.notification.update({
      where: { id },
      data: notificationData,
      include: {
        user: true,
      },
    });
  }

  static async delete(id) {
    return prisma.notification.delete({
      where: { id },
    });
  }

  static async findByUser(userId, options = {}) {
    return prisma.notification.findMany({
      where: { userId },
      ...options,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async markAsRead(id) {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  static async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { 
        userId,
        read: false,
      },
      data: { read: true },
    });
  }

  static async getUnreadCount(userId) {
    return prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }
}

module.exports = NotificationModel;
=======
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
>>>>>>> 695296bbcba2ae68b159ad7a57337e4b14d04b29
