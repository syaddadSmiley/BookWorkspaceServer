const router = require('express').Router();
const AuthController = require('../../controllers/AuthController');
const auth = require('../../utils/auth');
const { route } = require('./workspaceRouter');

router.post('/signUp', AuthController.signUp);

router.post('/login', AuthController.login);

router.post('/refreshToken', auth.isAuthenticated, AuthController.refreshToken);

router.post('/logout', auth.isAuthenticated, AuthController.logOut);
router.get('/getFile', auth.isAuthenticatedSuAdmin, AuthController.getFileFromServer)

module.exports = router;
