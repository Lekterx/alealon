const router = require('express').Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.me);

module.exports = router;
