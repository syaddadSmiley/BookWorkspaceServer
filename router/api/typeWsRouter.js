const router = require('express').Router();
const TypeWsController = require('../../controllers/TypeWsController');
const auth = require('../../utils/auth');

router.post('/create', TypeWsController.createTypeWs);

router.get('/:id', TypeWsController.getTypeWsById);

router.delete('/:id', TypeWsController.deleteTypeWsById);

module.exports = router;