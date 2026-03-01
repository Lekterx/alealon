const router = require('express').Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// Public
router.get('/', categoryController.list);
router.get('/:id', categoryController.getById);

// Admin
router.post('/', authenticateToken, requireRole('admin'), categoryController.create);
router.put('/:id', authenticateToken, requireRole('admin'), categoryController.update);
router.delete('/:id', authenticateToken, requireRole('admin'), categoryController.remove);

module.exports = router;
