const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const auth = require('../middleware/auth');

router.get('/event/:eventId', ticketController.getTicketsByEvent);      // Get ticket types for event
router.get('/my-tickets', auth, ticketController.getUserTickets);       // Get user's tickets
router.get('/:id', ticketController.getTicketTypeById);                 // Get ticket type by ID
router.put('/:id', auth, ticketController.updateTicketType);            // Update ticket type
router.post('/checkin/:qrCode', auth, ticketController.checkInAttendee); // Check in attendee

module.exports = router;
