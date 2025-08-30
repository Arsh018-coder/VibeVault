const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const validate = require('../middleware/validation');

router.post('/register', validate('register'), authController.register);
router.post('/login', validate('login'), authController.login);
router.get('/verify', authController.verifyToken);

module.exports = router;
