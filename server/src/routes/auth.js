const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Public routes
router.post('/register', validate('register'), authController.register);
router.post('/login', validate('login'), authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// Protected routes
router.use(authenticate);
router.get('/me', authController.getProfile);
router.put('/me', authController.updateProfile);
router.post('/change-password', authController.changePassword);
router.post('/logout', authController.logout);

module.exports = router;