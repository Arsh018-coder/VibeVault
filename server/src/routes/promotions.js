const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');

router.post('/validate', auth, promotionController.validatePromoCode);           // Validate promo code
router.get('/', promotionController.getPromotions);                             // Get promotions
router.post('/', auth, validate('createPromotion'), promotionController.createPromotion); // Create promotion (admin/organizer)

module.exports = router;
