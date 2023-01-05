const router = require('express').Router();
const UsersController = require('../../controllers/UsersController');
const auth = require('../../utils/auth');

router.get('/:id', auth.isAuthenticatedAdmin, UsersController.getUserById);
router.get('/booking/history', auth.isAuthenticated, UsersController.getBookingByIdUser);

router.delete('/:id', UsersController.deleteById);

router.get('/profile/details', auth.isAuthenticated, UsersController.getProfile);


module.exports = router;
