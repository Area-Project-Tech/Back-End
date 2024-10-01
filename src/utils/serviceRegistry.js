class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.modules = new Map();
  }

  registerService(name, service) {
    if (this.services.has(name)) {
      console.warn(`Service ${name} est déjà enregistré. Il sera remplacé.`);
    }
    this.services.set(name, service);
  }

  getService(name) {
    if (!this.services.has(name)) {
      throw new Error(`Service ${name} n'est pas enregistré.`);
    }
    return this.services.get(name);
  }

  registerModule(name, module) {
    if (this.modules.has(name)) {
      console.warn(`Module ${name} est déjà enregistré. Il sera remplacé.`);
    }
    this.modules.set(name, module);
  }

  getModule(name) {
    if (!this.modules.has(name)) {
      throw new Error(`Module ${name} n'est pas enregistré.`);
    }
    return this.modules.get(name);
  }

  getAllServices() {
    return Array.from(this.services.values()).map((service) => ({
      name: service.name,
      description: service.description,
      actions: Object.entries(service.actions).map(([actionName, action]) => ({
        name: actionName,
        description: action.description,
        parametersSchema: action.schema,
      })),
      reactions: Object.entries(service.reactions).map(([reactionName, reaction]) => ({
        name: reactionName,
        description: reaction.description,
        parametersSchema: reaction.schema,
      })),
    }));
  }

  getAllModules() {
    return Array.from(this.modules.values()).map((module) => ({
      name: module.name,
      description: module.description,
      parametersSchema: module.parametersSchema,
    }));
  }
}

module.exports = new ServiceRegistry();