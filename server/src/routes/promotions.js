const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const auth = require('../middleware/auth');

router.post('/apply', auth, promotionController.applyPromo);

module.exports = router;
