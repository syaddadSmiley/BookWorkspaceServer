const router = require('express').Router();
const UsersController = require('../../controllers/UsersController');
const auth = require('../../utils/auth');

router.get('/:id', auth.isAuthenticatedAdmin, UsersController.getUserById);
router.get('/booking/history', auth.isAuthenticated, UsersController.getBookingByIdUser);
router.get('/profile/details', auth.isAuthenticated, UsersController.getProfile);
router.get('/profile/img', auth.isAuthenticated, UsersController.getImageUser);

router.delete('/:id', auth.isAuthenticatedSuAdmin, UsersController.deleteById);

router.put('/profile/update', auth.isAuthenticated, UsersController.updateProfile);


module.exports = router;
