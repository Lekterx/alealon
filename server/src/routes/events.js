const router = require('express').Router();
const eventController = require('../controllers/eventController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const upload = require('../middleware/upload');

// Public
router.get('/', eventController.list);
router.get('/search', eventController.search);
router.get('/slug/:slug', eventController.getBySlug);
router.get('/:id', eventController.getById);

// Admin
router.get('/admin/all', authenticateToken, requireRole('admin'), eventController.listAll);
router.get('/admin/stats', authenticateToken, requireRole('admin'), eventController.stats);
router.post('/', authenticateToken, requireRole('admin'), upload.single('image'), eventController.create);
router.put('/:id', authenticateToken, requireRole('admin'), upload.single('image'), eventController.update);
router.delete('/:id', authenticateToken, requireRole('admin'), eventController.remove);

module.exports = router;
