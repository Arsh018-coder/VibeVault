const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/my-notifications', notificationController.getUserNotifications);
router.patch('/:id/read', notificationController.markNotificationAsRead);
router.patch('/mark-all-read', notificationController.markAllNotificationsAsRead);
router.get('/stats', notificationController.getNotificationStats);
router.put('/preferences', notificationController.updateNotificationPreferences);

// Admin routes
router.post('/send', 
  authorize(['ADMIN', 'ORGANIZER']), 
  notificationController.sendNotification
);

router.post('/send-bulk', 
  authorize(['ADMIN']), 
  notificationController.sendBulkNotification
);

module.exports = router;