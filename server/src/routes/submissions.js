const router = require('express').Router();
const submissionController = require('../controllers/submissionController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const upload = require('../middleware/upload');

// Public
router.post('/', upload.single('image'), submissionController.create);

// Admin
router.get('/', authenticateToken, requireRole('admin'), submissionController.list);
router.get('/stats', authenticateToken, requireRole('admin'), submissionController.stats);
router.get('/:id', authenticateToken, requireRole('admin'), submissionController.getById);
router.post('/:id/approve', authenticateToken, requireRole('admin'), submissionController.approve);
router.post('/:id/reject', authenticateToken, requireRole('admin'), submissionController.reject);

module.exports = router;
