const actions = require('./actions');
const reactions = require('./reactions');

module.exports = {
  name: 'OpenAI',
  description: 'Service OpenAI pour la génération de texte',
  actions: actions,
  reactions: reactions,
};