const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  actions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceAction' }],
  reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceReaction' }],
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);