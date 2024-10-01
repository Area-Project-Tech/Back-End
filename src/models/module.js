const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    parametersSchema: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Module', ModuleSchema);
