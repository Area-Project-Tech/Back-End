const express = require('express');
const dotenv = require('dotenv');
const app = require('./src/app');
const mongoose = require('mongoose');
const serviceRegistry = require('./src/services');

dotenv.config();

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connecté à la base de données');

    await initializeServicesAndModules();

    app.listen(PORT, () => {
      console.log(`Le serveur fonctionne sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur :', error);
  }
};

const initializeServicesAndModules = async () => {
  try {
    const Service = require('./src/models/service');
    const ServiceAction = require('./src/models/serviceAction');
    const ServiceReaction = require('./src/models/serviceReaction');

    const services = serviceRegistry.getAllServices();

    for (const serviceInfo of services) {
      let service = await Service.findOne({ name: serviceInfo.name });
      if (!service) {
        service = new Service({
          name: serviceInfo.name,
          description: serviceInfo.description,
        });
      } else {
        service.description = serviceInfo.description;
      }

      service.actions = [];
      for (const actionInfo of serviceInfo.actions || []) {
        let action = await ServiceAction.findOne({ name: actionInfo.name, serviceId: service._id });
        if (!action) {
          action = new ServiceAction({
            serviceId: service._id,
            name: actionInfo.name,
            description: actionInfo.description,
            parametersSchema: actionInfo.parametersSchema,
          });
        } else {
          action.description = actionInfo.description;
          action.parametersSchema = actionInfo.parametersSchema;
        }
        await action.save();
        service.actions.push(action._id);
      }

      service.reactions = [];
      for (const reactionInfo of serviceInfo.reactions || []) {
        let reaction = await ServiceReaction.findOne({ name: reactionInfo.name, serviceId: service._id });
        if (!reaction) {
          reaction = new ServiceReaction({
            serviceId: service._id,
            name: reactionInfo.name,
            description: reactionInfo.description,
            parametersSchema: reactionInfo.parametersSchema,
          });
        } else {
          reaction.description = reactionInfo.description;
          reaction.parametersSchema = reactionInfo.parametersSchema;
        }
        await reaction.save();
        service.reactions.push(reaction._id);
      }

      await service.save();
      console.log(`Service "${service.name}" initialisé avec succès.`);
    }

    const Module = require('./src/models/module');
    const modules = serviceRegistry.getAllModules();

    for (const moduleInfo of modules) {
      let module = await Module.findOne({ name: moduleInfo.name });
      if (!module) {
        module = new Module({
          name: moduleInfo.name,
          description: moduleInfo.description,
          parametersSchema: moduleInfo.parametersSchema,
        });
      } else {
        module.description = moduleInfo.description;
        module.parametersSchema = moduleInfo.parametersSchema;
      }

      await module.save();
      console.log(`Module "${module.name}" initialisé avec succès.`);
    }

    console.log('Tous les services, actions, réactions et modules ont été initialisés avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des services et modules :', error);
  }
};

startServer();