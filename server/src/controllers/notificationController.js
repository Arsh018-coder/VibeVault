const Notification = require('../models/notification');
const notificationService = require('../services/notificationService');

exports.sendNotification = async (req, res, next) => {
  try {
    const { userId, message, type } = req.body;
    await notificationService.send(userId, message, type);
    const notification = await Notification.create({ user: userId, message, type });
    res.status(201).json({ message: 'Notification sent', notification });
  } catch (err) {
    next(err);
  }
};