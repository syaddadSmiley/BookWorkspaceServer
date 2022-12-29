const router = require('express').Router();
const TypeWsController = require('../../controllers/TypeWsController');
const { isAuthenticatedAdmin } = require('../../utils/auth');
const auth = require('../../utils/auth');

router.post('/create', isAuthenticatedAdmin, TypeWsController.createTypeWs);

router.get('/:id', isAuthenticatedAdmin, TypeWsController.getTypeWsById);

router.delete('/:id', isAuthenticatedAdmin, TypeWsController.deleteTypeWsById);

module.exports = router;