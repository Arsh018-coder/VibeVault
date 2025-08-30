const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, analyticsController.getDashboardStats);     // Get dashboard stats
router.get('/events/:eventId', auth, analyticsController.getEventAnalytics); // Get event analytics
router.get('/sales', auth, analyticsController.getSalesReport);            // Get sales report

module.exports = router;
