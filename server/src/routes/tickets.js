const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const auth = require('../middleware/auth');

router.post('/', auth, ticketController.createTicket);   // Create ticket
router.get('/event/:eventId', ticketController.getTicketsByEvent); // Get tickets for event

module.exports = router;
