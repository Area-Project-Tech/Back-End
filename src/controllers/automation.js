const Automation = require('../models/automation');
const AutomationNode = require('../models/automationNode');
const automationExecutor = require('../services/automationExecutor');

exports.getAutomations = async (req, res, next) => {
  try {
    const automations = await Automation.find({ userId: req.user.id }).populate('nodes');
    res.status(200).json({ automations });
  } catch (error) {
    next(error);
  }
};

exports.getAutomationById = async (req, res, next) => {
  try {
    const automation = await Automation.findOne({ _id: req.params.automationId, userId: req.user.id }).populate('nodes');
    console.log('user', req.user.id);
    if (!automation) {
      return res.status(404).json({ message: 'Automatisation non trouvée' });
    }

    const populatedNodes = await AutomationNode.populate(automation.nodes, {
      path: 'nextNodeIds',
      model: 'AutomationNode'
    });

    automation.nodes = populatedNodes;

    res.status(200).json({ automation });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'automatisation:', error);
    next(error);
  }
};

exports.createAutomation = async (req, res, next) => {
  try {
    const { name, description, enabled } = req.body;

    const automation = new Automation({
      userId: req.user.id,
      name,
      description,
      enabled,
      nodes: [],
    });

    await automation.save();

    res.status(201).json({ message: 'Automatisation créée avec succès', automation });
  } catch (error) {
    next(error);
  }
};

exports.updateAutomation = async (req, res, next) => {
  try {
    const { name, description, enabled } = req.body;
    const automation = await Automation.findOneAndUpdate(
      { _id: req.params.automationId, userId: req.user.id },
      { name, description, enabled },
      { new: true }
    );
    if (!automation) return res.status(404).json({ message: 'Automatisation non trouvée' });
    res.status(200).json({ message: 'Automatisation mise à jour avec succès', automation });
  } catch (error) {
    next(error);
  }
};

exports.deleteAutomation = async (req, res, next) => {
  try {
    const automation = await Automation.findOneAndDelete({ _id: req.params.automationId, userId: req.user.id });
    if (!automation) {
      return res.status(404).json({ message: 'Automatisation non trouvée' });
    }
    await AutomationNode.deleteMany({ automationId: automation.id });
    res.status(200).json({ message: 'Automatisation supprimée avec succès' });
  } catch (error) {
    next(error);
  }
};

exports.executeAutomation = async (req, res, next) => {
    try {
        const { automationId } = req.params;
  
        const automation = await Automation.findOne({ _id: automationId, userId: req.user.id });
        if (!automation) {
            return res.status(404).json({ message: 'Automatisation non trouvée' });
        }
  
        await automationExecutor.executeAutomation(automationId);
  
        res.status(200).json({ message: 'Automatisation exécutée avec succès' });
    } catch (error) {
        console.error(`Erreur lors de l'exécution de l'automatisation ${req.params.automationId}:`, error);
        next(error);
    }
};
