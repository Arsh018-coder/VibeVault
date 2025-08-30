const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Public routes
router.post('/validate', validate('validatePromoCode'), promotionController.validatePromoCode);

// Protected routes
router.use(authenticate);

// Organizer routes
router.post('/', 
  authorize(['ORGANIZER', 'ADMIN']), 
  validate('createPromotion'), 
  promotionController.createPromotion
);

router.get('/my-promotions', 
  authorize(['ORGANIZER', 'ADMIN']), 
  promotionController.getPromotions
);

router.get('/:id', 
  authorize(['ORGANIZER', 'ADMIN']), 
  promotionController.getPromotionById
);

router.put('/:id', 
  authorize(['ORGANIZER', 'ADMIN']), 
  validate('createPromotion'), 
  promotionController.updatePromotion
);

router.delete('/:id', 
  authorize(['ORGANIZER', 'ADMIN']), 
  promotionController.deletePromotion
);

router.patch('/:id/toggle', 
  authorize(['ORGANIZER', 'ADMIN']), 
  promotionController.togglePromotionStatus
);

// Admin routes
router.get('/', 
  authorize(['ADMIN']), 
  promotionController.getPromotions
);

module.exports = router;