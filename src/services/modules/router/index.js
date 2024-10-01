const routerHandler = require('./handler');

module.exports = {
  name: 'router',
  description: 'Routage vers plusieurs nœuds suivants en fonction de conditions',
  parametersSchema: {
    conditions: {
      type: 'array',
      required: true,
      description: 'Liste des conditions pour le routage',
      items: {
        type: 'object',
        properties: {
          expression: { type: 'string', required: true },
          nextNodeId: { type: 'string', required: true },
        },
      },
    },
  },
  handler: routerHandler,
};