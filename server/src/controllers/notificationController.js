const NotificationService = require('../services/notificationService');
const prisma = require('../db/prisma');

exports.getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, isRead } = req.query;

    const skip = (page - 1) * limit;
    const where = { userId };

    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.notification.count({ where }),
      NotificationService.getUnreadCount(userId)
    ]);

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error('Get user notifications error:', err);
    res.status(500).json({ message: 'Failed to get notifications' });
  }
};

exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to modify this notification' });
    }

    const updatedNotification = await NotificationService.markAsRead(id);

    res.json({
      message: 'Notification marked as read',
      notification: updatedNotification
    });

  } catch (err) {
    console.error('Mark notification as read error:', err);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

exports.markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await NotificationService.markAllAsRead(userId);

    res.json({ message: 'All notifications marked as read' });

  } catch (err) {
    console.error('Mark all notifications as read error:', err);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await NotificationService.deleteNotification(id);

    res.json({ message: 'Notification deleted successfully' });

  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

exports.sendNotification = async (req, res, next) => {
  try {
    const { userId, message, type = 'system', title } = req.body;
    const senderId = req.user.userId;

    // Check if sender has permission (admin or organizer)
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { role: true }
    });

    if (!sender || !['ADMIN', 'ORGANIZER'].includes(sender.role)) {
      return res.status(403).json({ message: 'Not authorized to send notifications' });
    }

    // Get recipient user
    const recipient = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true
      }
    });

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    const notification = await NotificationService.send(recipient, message, type);

    res.status(201).json({ message: 'Notification sent', notification });

  } catch (err) {
    console.error('Send notification error:', err);
    res.status(500).json({ message: 'Failed to send notification' });
  }
};

exports.sendBulkNotification = async (req, res, next) => {
  try {
    const { userIds, message, type = 'system', title } = req.body;
    const senderId = req.user.userId;

    // Check if sender has permission (admin only for bulk)
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { role: true }
    });

    if (!sender || sender.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to send bulk notifications' });
    }

    // Get recipient users
    const recipients = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true
      }
    });

    if (recipients.length === 0) {
      return res.status(404).json({ message: 'No valid recipients found' });
    }

    const result = await NotificationService.sendToMultipleUsers(recipients, message, type);

    res.json({
      message: 'Bulk notification sent',
      successful: result.successful,
      failed: result.failed,
      total: recipients.length
    });

  } catch (err) {
    console.error('Send bulk notification error:', err);
    res.status(500).json({ message: 'Failed to send bulk notification' });
  }
};

exports.getNotificationStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [total, unread, read] = await Promise.all([
      prisma.notification.count({
        where: { userId }
      }),
      prisma.notification.count({
        where: { userId, isRead: false }
      }),
      prisma.notification.count({
        where: { userId, isRead: true }
      })
    ]);

    // Get notifications by type
    const byType = await prisma.notification.groupBy({
      by: ['type'],
      where: { userId },
      _count: {
        type: true
      }
    });

    res.json({
      total,
      unread,
      read,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {})
    });

  } catch (err) {
    console.error('Get notification stats error:', err);
    res.status(500).json({ message: 'Failed to get notification stats' });
  }
};

exports.updateNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { emailNotifications, smsNotifications, pushNotifications } = req.body;

    // Update user preferences (assuming we have a preferences field or separate table)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        // Assuming we add these fields to the user model
        emailNotifications: emailNotifications !== undefined ? emailNotifications : undefined,
        smsNotifications: smsNotifications !== undefined ? smsNotifications : undefined,
        pushNotifications: pushNotifications !== undefined ? pushNotifications : undefined
      },
      select: {
        id: true,
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true
      }
    });

    res.json({
      message: 'Notification preferences updated',
      preferences: updatedUser
    });

  } catch (err) {
    console.error('Update notification preferences error:', err);
    res.status(500).json({ message: 'Failed to update notification preferences' });
  }
};