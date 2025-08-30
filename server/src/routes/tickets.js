const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/:id', ticketController.getTicketTypeById);
router.get('/:id/availability', ticketController.checkTicketAvailability);

// Protected routes
router.use(authenticate);

// Organizer routes
router.post('/', 
  authorize(['ORGANIZER', 'ADMIN']), 
  ticketController.createTicketType
);

router.put('/:id', 
  authorize(['ORGANIZER', 'ADMIN']), 
  ticketController.updateTicketType
);

router.delete('/:id', 
  authorize(['ORGANIZER', 'ADMIN']), 
  ticketController.deleteTicketType
);

router.patch('/:id/toggle', 
  authorize(['ORGANIZER', 'ADMIN']), 
  ticketController.toggleTicketTypeStatus
);

router.get('/event/:eventId', ticketController.getEventTicketTypes);

// Get current user's tickets
router.get('/my-tickets', ticketController.getUserTickets);

module.exports = router;