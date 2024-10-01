const waitHandler = require('./handler');

module.exports = {
  name: 'wait',
  description: 'Attend un certain temps avant de continuer',
  parametersSchema: {
    duration: {
      type: 'number',
      required: true,
      description: 'Durée en millisecondes',
    },
  },
  handler: waitHandler,
};