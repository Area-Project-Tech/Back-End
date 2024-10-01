const mongoose = require('mongoose');

const AutomationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    enabled: { type: Boolean, default: true },
    nodes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AutomationNode' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Automation', AutomationSchema);
