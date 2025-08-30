const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validation');

router.post('/register', validate('register'), authController.register);
router.post('/login', validate('login'), authController.login);

module.exports = router;
