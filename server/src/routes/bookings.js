const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

router.post('/', auth, bookingController.createBooking);           // Create booking
router.get('/', auth, bookingController.getUserBookings);          // Get user bookings
router.get('/:id', auth, bookingController.getBookingById);        // Get booking by ID
router.patch('/:id/cancel', auth, bookingController.cancelBooking); // Cancel booking

module.exports = router;
