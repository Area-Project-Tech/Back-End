const express = require('express');
const router = express.Router({ mergeParams: true });
const automationNodeController = require('../controllers/automationNode');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware.verifyToken);

router.get('/', authMiddleware.verifyToken, automationNodeController.getNodes);
router.post('/', authMiddleware.verifyToken, automationNodeController.createNode);
router.put('/:nodeId', authMiddleware.verifyToken, automationNodeController.updateNode);
router.delete('/:nodeId', authMiddleware.verifyToken, automationNodeController.deleteNode);

router.put('/:nodeId/link', authMiddleware.verifyToken, automationNodeController.linkNode);
router.put('/:nodeId/unlink', authMiddleware.verifyToken, automationNodeController.unlinkNode);

module.exports = router;
