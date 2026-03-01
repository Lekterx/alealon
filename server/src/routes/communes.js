const router = require('express').Router();
const communeController = require('../controllers/communeController');

router.get('/', communeController.list);

module.exports = router;
