const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/my-bookings', bookingController.getUserBookings);
router.post('/', validate('createBooking'), bookingController.createBooking);
router.get('/:id', bookingController.getBookingById);
router.patch('/:id/cancel', bookingController.cancelBooking);

// Organizer routes
router.get('/event/:eventId', 
  authorize(['ORGANIZER', 'ADMIN']), 
  bookingController.getEventBookings
);

router.patch('/:id/confirm', 
  authorize(['ORGANIZER', 'ADMIN']), 
  bookingController.confirmBooking
);

// Admin routes
router.get('/', 
  authorize(['ADMIN']), 
  bookingController.getAllBookings
);

module.exports = router;