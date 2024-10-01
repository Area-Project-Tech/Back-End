const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automation');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware.verifyToken);

router.get('/', authMiddleware.verifyToken, automationController.getAutomations);
router.post('/', authMiddleware.verifyToken, automationController.createAutomation);
router.get('/:automationId', authMiddleware.verifyToken, automationController.getAutomationById);
router.put('/:automationId', authMiddleware.verifyToken, automationController.updateAutomation);
router.delete('/:automationId', authMiddleware.verifyToken, automationController.deleteAutomation);

router.post('/:automationId/execute', authMiddleware.verifyToken, automationController.executeAutomation);

module.exports = router;
