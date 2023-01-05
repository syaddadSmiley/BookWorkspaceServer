const router = require('express').Router();
const ServicesController = require('../../controllers/ServicesController');
const { isAuthenticated, isAuthenticatedAdmin } = require('../../utils/auth');
const auth = require('../../utils/auth');


router.get('/:id', ServicesController.getServicesById);

router.post('/booking', isAuthenticated, ServicesController.createBooking);
router.post('/admin/create', isAuthenticatedAdmin, ServicesController.createServices);



module.exports = router;