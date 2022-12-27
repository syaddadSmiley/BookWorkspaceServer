const router = require('express').Router();
const ServicesController = require('../../controllers/ServicesController');
const auth = require('../../utils/auth');


router.get('/:id', ServicesController.getTypeWsById);
router.post('/types/detail', ServicesController.createTypeWs);


module.exports = router;