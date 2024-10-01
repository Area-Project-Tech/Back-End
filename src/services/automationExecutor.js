const Automation = require('../models/automation');
const AutomationNode = require('../models/automationNode');
const serviceRegistry = require('.');
const UserService = require('../models/userService');
const Service = require('../models/service');

const executeNode = async (node, userId, inputData) => {
  const context = {
    userId: userId,
    inputData: inputData,
  };

  if (node.nodeType === 'action') {
    return await executeActionNode(node, context);
  } else if (node.nodeType === 'reaction') {
    return await executeReactionNode(node, context);
  } else if (node.nodeType === 'module') {
    return await executeModuleNode(node, context);
  } else {
    throw new Error(`Type de nœud "${node.nodeType}" non supporté`);
  }
};

const executeActionNode = async (node, context) => {
  const service = serviceRegistry.getService(node.serviceName);
  if (!service) {
    throw new Error(`Service "${node.serviceName}" non trouvé`);
  }

  const userService = await UserService.findOne({ userId: context.userId, serviceId: node.serviceId });
  if (!userService) {
    throw new Error(`L'utilisateur n'a pas connecté le service "${node.serviceName}"`);
  }

  if (node.serviceName === 'Google') {
    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: userService.accessToken,
      refresh_token: userService.refreshToken,
      expiry_date: userService.expiresAt ? userService.expiresAt.getTime() : null,
    });

    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        userService.refreshToken = tokens.refresh_token;
      }
      if (tokens.access_token) {
        userService.accessToken = tokens.access_token;
      }
      if (tokens.expiry_date) {
        userService.expiresAt = new Date(tokens.expiry_date);
      }
      await userService.save();
    });

    context.oauth2Client = oauth2Client;
  }

  const action = service.actions[node.actionReactionName];
  if (!action) {
    throw new Error(`Action "${node.actionReactionName}" non trouvée pour le service "${node.serviceName}"`);
  }

  return await action.handler(node.parameters, context);
};
const executeReactionNode = async (node, context) => {
  const service = serviceRegistry.getService(node.serviceName);
  if (!service) {
    throw new Error(`Service "${node.serviceName}" non trouvé`);
  }

  const userService = await UserService.findOne({ userId: context.userId, serviceId: node.serviceId });
  if (!userService && node.serviceName !== 'Email') {
    throw new Error(`L'utilisateur n'a pas connecté le service "${node.serviceName}"`);
  }

  if (node.serviceName === 'Google') {
    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: userService.accessToken,
      refresh_token: userService.refreshToken,
      expiry_date: userService.expiresAt ? userService.expiresAt.getTime() : null,
    });

    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        userService.refreshToken = tokens.refresh_token;
      }
      if (tokens.access_token) {
        userService.accessToken = tokens.access_token;
      }
      if (tokens.expiry_date) {
        userService.expiresAt = new Date(tokens.expiry_date);
      }
      await userService.save();
    });
    context.oauth2Client = oauth2Client;
  }

  const reaction = service.reactions[node.actionReactionName];
  if (!reaction) {
    throw new Error(`Réaction "${node.actionReactionName}" non trouvée pour le service "${node.serviceName}"`);
  }

  return await reaction.handler(node.parameters, context);
};

const executeModuleNode = async (node, context) => {
  const module = serviceRegistry.getModule(node.moduleName);
  if (!module) {
    throw new Error(`Module "${node.moduleName}" non trouvé`);
  }

  return await module.handler(node.parameters, context);
};

const executeAutomation = async (automationId) => {
  const automation = await Automation.findById(automationId).populate('nodes');
  if (!automation) {
    throw new Error(`Automatisation ${automationId} non trouvée`);
  }

  const nodesMap = new Map(automation.nodes.map((node) => [node._id.toString(), node]));

  let currentNode = automation.nodes.find((node) => node.isStartNode);

  if (!currentNode) {
    throw new Error('Nœud de départ non trouvé dans l\'automatisation');
  }

  let inputData = null;

  while (currentNode) {
    try {
      inputData = await executeNode(currentNode, automation.userId, inputData);

      if (currentNode.nodeType === 'module' && currentNode.moduleName === 'router') {
        const nextNodeId = inputData;
        currentNode = nodesMap.get(nextNodeId);
      } else if (currentNode.nextNodeIds && currentNode.nextNodeIds.length > 0) {
        const nextNodeId = currentNode.nextNodeIds[0];
        currentNode = nodesMap.get(nextNodeId.toString());
      } else {
        currentNode = null;
      }
    } catch (error) {
      console.error(`Erreur lors de l'exécution du nœud ${currentNode._id}:`, error);
      throw error;
    }
  }

  return inputData;
};

module.exports = {
  executeAutomation,
};