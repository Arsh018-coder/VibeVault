const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.get('/', auth, notificationController.getUserNotifications);        // Get user notifications
router.post('/', auth, notificationController.createNotification);         // Create notification
router.patch('/:id/read', auth, notificationController.markAsRead);        // Mark as read
router.patch('/read-all', auth, notificationController.markAllAsRead);     // Mark all as read
router.delete('/:id', auth, notificationController.deleteNotification);    // Delete notification

module.exports = router;
