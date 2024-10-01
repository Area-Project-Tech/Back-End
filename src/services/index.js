const serviceRegistry = require('../utils/serviceRegistry');

const emailService = require('./email');
const googleService = require('./google');
const openaiService = require('./openai');

const waitModule = require('./modules/wait');
const routerModule = require('./modules/router');

serviceRegistry.registerService('Email', emailService);
serviceRegistry.registerService('Google', googleService);
serviceRegistry.registerService('OpenAI', openaiService);

serviceRegistry.registerModule('wait', waitModule);

module.exports = serviceRegistry;