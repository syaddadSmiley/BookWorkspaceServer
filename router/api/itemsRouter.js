const router = require('express').Router();
const ItemsController = require('../../controllers/ItemsController');
const auth = require('../../utils/auth');

router.get('/getUserItems', auth.isAuthenticated, ItemsController.getUserItems);

module.exports = router;
