

const router = require('express').Router();

router.use('/users', require('./usersRouter'));

router.use('/email', require('./sendEmail'));

router.use('/', require('./authRouter'));

router.use('/ws', require('./workspaceRouter'));

router.use('/type_ws', require('./typeWsRouter'));

router.use('/services', require('./servicesRouter'));

module.exports = router;
