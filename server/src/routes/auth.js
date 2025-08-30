const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);

// Protected routes
router.use(authenticate);
router.get('/me', authController.getProfile);
router.put('/me', authController.updateProfile);
router.post('/change-password', authController.changePassword);

module.exports = router;