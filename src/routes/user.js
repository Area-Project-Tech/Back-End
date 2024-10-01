const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const authMiddleware = require('../middlewares/auth');

router.get('/profile', authMiddleware.verifyToken, userController.getLoginInfo);
router.put('/profile', authMiddleware.verifyToken, userController.updateUser);
router.delete('/profile', authMiddleware.verifyToken, userController.deleteUser);

router.post('/change-password', authMiddleware.verifyToken, userController.changePassword);
router.post('/set-password', authMiddleware.verifyToken, userController.setPassword);

router.post('/link-provider/:provider', authMiddleware.verifyToken, userController.linkProvider);
router.post('/unlink-provider/:provider', authMiddleware.verifyToken, userController.unlinkProvider);


module.exports = router;
