const emailService = require("./emailService");
const smsService = require("./smsService");
const whatsappService = require("./whatsappService");
const NotificationModel = require("../models/notification");

class NotificationService {
  static async send(user, message, type = "system", saveToDb = true) {
    try {
      // Save notification to database if requested
      let notification = null;
      if (saveToDb) {
        notification = await NotificationModel.create({
          userId: user.id,
          message,
          type,
          read: false,
        });
      }

      // Send notification based on type
      switch (type) {
        case "email":
          await emailService.sendEmail(user.email, "Notification", message);
          break;
        case "sms":
          if (user.phone) {
            await smsService.sendSMS(user.phone, message);
          }
          break;
        case "whatsapp":
          if (user.phone) {
            await whatsappService.sendWhatsApp(user.phone, message);
          }
          break;
        case "system":
          // System notifications are only stored in database
          break;
        default:
          throw new Error("Invalid notification type");
      }

      console.log(`Notification sent via ${type} to user ${user.id}`);
      return notification;
    } catch (err) {
      console.error("Notification failed:", err);
      throw err;
    }
  }

  static async sendToMultipleUsers(users, message, type = "system") {
    try {
      const results = await Promise.allSettled(
        users.map(user => this.send(user, message, type))
      );

      const successful = results.filter(result => result.status === "fulfilled").length;
      const failed = results.filter(result => result.status === "rejected").length;

      console.log(`Bulk notification: ${successful} successful, ${failed} failed`);
      return { successful, failed, results };
    } catch (err) {
      console.error("Bulk notification failed:", err);
      throw err;
    }
  }

  static async getUserNotifications(userId, options = {}) {
    try {
      return await NotificationModel.findByUser(userId, options);
    } catch (err) {
      console.error("Failed to get user notifications:", err);
      throw err;
    }
  }

  static async markAsRead(notificationId) {
    try {
      return await NotificationModel.markAsRead(notificationId);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      throw err;
    }
  }

  static async markAllAsRead(userId) {
    try {
      return await NotificationModel.markAllAsRead(userId);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      throw err;
    }
  }

  static async getUnreadCount(userId) {
    try {
      return await NotificationModel.getUnreadCount(userId);
    } catch (err) {
      console.error("Failed to get unread count:", err);
      throw err;
    }
  }

  static async deleteNotification(notificationId) {
    try {
      return await NotificationModel.delete(notificationId);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      throw err;
    }
  }

  // Predefined notification templates
  static async sendBookingConfirmation(user, booking) {
    const message = `Your booking for "${booking.event.title}" has been confirmed. Booking ID: ${booking.id}`;
    return this.send(user, message, "email");
  }

  static async sendBookingCancellation(user, booking) {
    const message = `Your booking for "${booking.event.title}" has been cancelled. Booking ID: ${booking.id}`;
    return this.send(user, message, "email");
  }

  static async sendEventReminder(user, event) {
    const eventDate = new Date(event.date).toLocaleDateString();
    const message = `Reminder: "${event.title}" is scheduled for ${eventDate} at ${event.location}`;
    return this.send(user, message, "email");
  }

  static async sendPaymentConfirmation(user, payment) {
    const message = `Payment of ₹${payment.amount} has been successfully processed. Transaction ID: ${payment.transactionId}`;
    return this.send(user, message, "email");
  }
}

module.exports = NotificationService;
