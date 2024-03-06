const router = require('express').Router();

router.use('/', require('./authRouter'));
router.use('/items', require('./itemsRouter'));

router.use('/type_ws', require('./typeWsRouter'));

router.use('/services', require('./servicesRouter'));

module.exports = router;
