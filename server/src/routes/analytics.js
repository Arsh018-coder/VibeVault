const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Dashboard stats
router.get('/dashboard', 
  authorize(['ORGANIZER', 'ADMIN']), 
  analyticsController.getDashboardStats
);

// Booking analytics
router.get('/bookings', 
  authorize(['ORGANIZER', 'ADMIN']), 
  analyticsController.getBookingAnalytics
);

// Revenue analytics
router.get('/revenue', 
  authorize(['ORGANIZER', 'ADMIN']), 
  analyticsController.getRevenueAnalytics
);

// Event performance
router.get('/event/:eventId', 
  authorize(['ORGANIZER', 'ADMIN']), 
  analyticsController.getEventPerformance
);

// Export data
router.get('/export', 
  authorize(['ORGANIZER', 'ADMIN']), 
  analyticsController.exportAnalyticsData
);

module.exports = router;