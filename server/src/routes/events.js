const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/featured', eventController.getFeaturedEvents);
router.get('/search', eventController.searchEvents);
router.get('/:slug', eventController.getEventBySlug);
router.get('/:id/tickets', eventController.getEventTickets);

// Protected routes
router.use(authenticate);

// Organizer dashboard
router.get('/organizer/dashboard', 
  authorize(['ORGANIZER', 'ADMIN']),
  eventController.getOrganizerDashboard
);

// Organizer routes
router.post('/', 
  authorize(['ORGANIZER', 'ADMIN']), 
  validate('createEvent'), 
  eventController.createEvent
);

router.put('/:id', 
  authorize(['ORGANIZER', 'ADMIN']), 
  validate('createEvent'), 
  eventController.updateEvent
);

router.delete('/:id', 
  authorize(['ORGANIZER', 'ADMIN']), 
  eventController.deleteEvent
);

router.patch('/:id/status', 
  authorize(['ORGANIZER', 'ADMIN']), 
  eventController.updateEventStatus
);

// Admin routes
router.patch('/:id/feature', 
  authorize(['ADMIN']), 
  eventController.toggleFeatured
);

module.exports = router;