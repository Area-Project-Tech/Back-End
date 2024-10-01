const mongoose = require('mongoose');

const ServiceActionSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    name: { type: String, required: true },
    description: { type: String },
    parametersSchema: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceAction', ServiceActionSchema);
