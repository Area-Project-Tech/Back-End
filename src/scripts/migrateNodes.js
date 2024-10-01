const mongoose = require('mongoose');
const AutomationNode = require('../automationNode');
const Service = require('../service');

const migrateNodes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connecté à MongoDB');

    const nodes = await AutomationNode.find();
    for (const node of nodes) {
      const service = await Service.findById(node.serviceId);
      if (service) {
        node.serviceName = service.name;
        await node.save();
        console.log(`Nœud ${node._id} mis à jour avec le serviceName ${service.name}`);
      } else {
        console.warn(`Service non trouvé pour le nœud ${node._id}, suppression du nœud.`);
        await AutomationNode.deleteOne({ _id: node._id });
      }
    }

    console.log('Migration terminée');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
  }
};

migrateNodes();
