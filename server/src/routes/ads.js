const router = require('express').Router();
const adController = require('../controllers/adController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const upload = require('../middleware/upload');

// Public — banner rotation
router.get('/banner/:placement', adController.getBanner);
router.post('/click/:id', adController.trackClick);

// Admin — campaigns
router.get('/campaigns', authenticateToken, requireRole('admin'), adController.listCampaigns);
router.get('/campaigns/:id', authenticateToken, requireRole('admin'), adController.getCampaign);
router.get('/campaigns/:id/stats', authenticateToken, requireRole('admin'), adController.campaignStats);
router.post('/campaigns', authenticateToken, requireRole('admin'), upload.single('image'), adController.createCampaign);
router.put('/campaigns/:id', authenticateToken, requireRole('admin'), upload.single('image'), adController.updateCampaign);

// Admin — boosts
router.get('/boosts', authenticateToken, requireRole('admin'), adController.listBoosts);
router.post('/boosts', authenticateToken, requireRole('admin'), adController.createBoost);
router.put('/boosts/:id', authenticateToken, requireRole('admin'), adController.updateBoost);

module.exports = router;
