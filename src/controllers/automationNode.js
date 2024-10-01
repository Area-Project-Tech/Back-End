const AutomationNode = require('../models/automationNode');
const Automation = require('../models/automation');
const Service = require('../models/service');
const serviceRegistry = require('../services');

exports.getNodes = async (req, res, next) => {
  try {
    const { automationId } = req.params;
    const nodes = await AutomationNode.find({ automationId });
    res.status(200).json({ nodes });
  } catch (error) {
    next(error);
  }
};

exports.createNode = async (req, res, next) => {
  try {
    const { automationId } = req.params;
    const { nodeType, serviceName, actionReactionName, moduleName, parameters, nextNodeIds, isStartNode } = req.body;

    let serviceId = null;
    if (nodeType === 'action' || nodeType === 'reaction') {
      const service = await Service.findOne({ name: serviceName });
      if (!service) {
        return res.status(404).json({ message: 'Service non trouvé' });
      }
      serviceId = service._id;
    } else if (nodeType === 'module') {
      const module = serviceRegistry.getModule(moduleName);
      if (!module) {
        return res.status(404).json({ message: 'Module non trouvé' });
      }
    } else {
      return res.status(400).json({ message: 'Type de nœud invalide' });
    }

    const node = new AutomationNode({
      automationId,
      nodeType,
      serviceId,
      serviceName,
      actionReactionName,
      moduleName,
      parameters,
      nextNodeIds,
      isStartNode,
    });

    await node.save();

    const automation = await Automation.findById(automationId);
    automation.nodes.push(node._id);
    await automation.save();

    res.status(201).json({ message: 'Nœud créé avec succès', node });
  } catch (error) {
    next(error);
  }
};

exports.updateNode = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const { nodeType, serviceName, actionReactionName, moduleName, parameters, nextNodeIds, isStartNode } = req.body;

    const node = await AutomationNode.findById(nodeId);
    if (!node) {
      return res.status(404).json({ message: 'Nœud non trouvé' });
    }

    node.nodeType = nodeType;
    node.serviceName = serviceName;
    node.actionReactionName = actionReactionName;
    node.moduleName = moduleName;
    node.parameters = parameters;
    node.nextNodeIds = nextNodeIds;
    node.isStartNode = isStartNode;

    await node.save();

    res.status(200).json({ message: 'Nœud modifié avec succès', node });
  } catch (error) {
    next(error);
  }
};


exports.deleteNode = async (req, res, next) => {
  try {
    const { nodeId } = req.params;

    const node = await AutomationNode.findById(nodeId);
    if (!node) {
      return res.status(404).json({ message: 'Nœud non trouvé' });
    }

    await node.delete();

    res.status(200).json({ message: 'Nœud supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};

exports.linkNode = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const { nextNodeId } = req.body;

    const node = await AutomationNode.findById(nodeId);
    if (!node) {
      return res.status(404).json({ message: 'Nœud non trouvé' });
    }

    node.nextNodeIds.push(nextNodeId);
    await node.save();

    res.status(200).json({ message: 'Nœud lié avec succès' });
  } catch (error) {
    next(error);
  }
};

exports.unlinkNode = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const { nextNodeId } = req.body;

    const node = await AutomationNode.findById(nodeId);
    if (!node) {
      return res.status(404).json({ message: 'Nœud non trouvé' });
    }

    node.nextNodeIds = node.nextNodeIds.filter(id => id !== nextNodeId);
    await node.save();

    res.status(200).json({ message: 'Nœud délié avec succès' });
  } catch (error) {
    next(error);
  }
};
