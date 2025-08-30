const Notification = require('../models/notification');
const notificationService = require('../services/notificationService');

exports.sendNotification = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};
