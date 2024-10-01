const mongoose = require('mongoose');

const AutomationNodeSchema = new mongoose.Schema(
  {
    automationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Automation', required: true },
    nodeType: { type: String, required: true, enum: ['action', 'reaction', 'module'] },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    serviceName: { type: String },
    actionReactionName: { type: String },
    moduleName: { type: String },
    parameters: { type: mongoose.Schema.Types.Mixed },
    nextNodeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AutomationNode' }],
    isStartNode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AutomationNode', AutomationNodeSchema);