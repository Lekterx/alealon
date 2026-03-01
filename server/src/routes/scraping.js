const router = require('express').Router();
const scrapingController = require('../controllers/scrapingController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// Admin only
router.use(authenticateToken, requireRole('admin'));

router.get('/sources', scrapingController.listSources);
router.get('/sources/:id', scrapingController.getSource);
router.post('/sources', scrapingController.createSource);
router.put('/sources/:id', scrapingController.updateSource);
router.delete('/sources/:id', scrapingController.deleteSource);

router.post('/sources/:id/run', scrapingController.runSource);

router.get('/logs', scrapingController.listLogs);

module.exports = router;
