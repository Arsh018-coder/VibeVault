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