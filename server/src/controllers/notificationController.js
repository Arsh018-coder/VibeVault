const prisma = require('../db/prisma');

exports.getUserNotifications = async (req, res, next) => {
  try {
<<<<<<< HEAD
    const userId = req.user.userId;
    const { page = 1, limit = 20, isRead } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId,
      ...(isRead !== undefined && { isRead: isRead === 'true' })
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId, isRead: false }
      })
    ]);

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
=======
    const { userId, message, type } = req.body;

    // Call your service as before
    await notificationService.send(userId, message, type);

    // Create notification in PostgreSQL
    const notification = await Notification.create({
      userId,   // Sequelize foreign key
      message,
      type
    });

    res.status(201).json({ message: 'Notification sent', notification });
>>>>>>> 695296bbcba2ae68b159ad7a57337e4b14d04b29
  } catch (err) {
    console.error('Get user notifications error:', err);
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await prisma.notification.updateMany({
      where: {
        id,
        userId
      },
      data: {
        isRead: true
      }
    });

    if (notification.count === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Mark notification as read error:', err);
    next(err);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all notifications as read error:', err);
    next(err);
  }
};

exports.createNotification = async (req, res, next) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      scheduledFor,
      priority = 'normal'
    } = req.body;

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId,
        relatedType,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        priority,
        status: scheduledFor ? 'scheduled' : 'sent'
      }
    });

    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });
  } catch (err) {
    console.error('Create notification error:', err);
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const deleted = await prisma.notification.deleteMany({
      where: {
        id,
        userId
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Delete notification error:', err);
    next(err);
  }
};
