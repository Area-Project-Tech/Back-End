const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service');
const authMiddleware = require('../middlewares/auth');
const passport = require('passport');

router.get('/connect/google', authMiddleware.verifyToken, serviceController.connectGoogle);
router.get('/connect/google/callback', serviceController.handleGoogleCallback);

router.get('/connect/github', authMiddleware.verifyToken, serviceController.connectGithub);
router.get('/connect/github/callback', serviceController.handleGithubCallback);

router.post('/connect/openai', authMiddleware.verifyToken, serviceController.connectOpenAI);

router.post('/disconnect/:serviceName', authMiddleware.verifyToken, serviceController.disconnectService);

router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);

router.get('/user/services', authMiddleware.verifyToken, serviceController.getUserServices);
router.get('/:id/actions', authMiddleware.verifyToken, serviceController.getServiceActions);
router.get('/:id/reactions', authMiddleware.verifyToken, serviceController.getServiceReactions);

module.exports = router;