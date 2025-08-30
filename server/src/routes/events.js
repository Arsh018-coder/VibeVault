const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');

router.post('/', auth, eventController.createEvent);        // Create event
router.get('/', eventController.getEvents);                // Get all events
router.get('/slug/:slug', eventController.getEventBySlug); // Get event by slug
router.get('/:id', eventController.getEventById);          // Get single event by ID

module.exports = router;
