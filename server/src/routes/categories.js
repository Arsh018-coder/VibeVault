const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategoryBySlug);
router.get('/:slug/events', categoryController.getCategoryEvents);

// Admin routes
router.use(authenticate);
router.use(authorize(['ADMIN']));

router.post('/', validate('createCategory'), categoryController.createCategory);
router.put('/:id', validate('createCategory'), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.patch('/:id/toggle', categoryController.toggleCategoryStatus);

module.exports = router;