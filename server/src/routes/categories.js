const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');

router.get('/', categoryController.getCategories);                    // Get all categories
router.get('/slug/:slug', categoryController.getCategoryBySlug);      // Get category by slug
router.get('/:id', categoryController.getCategoryById);              // Get category by ID
router.post('/', auth, categoryController.createCategory);           // Create category (admin only)

module.exports = router;