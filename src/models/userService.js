const mongoose = require('mongoose');

const UserServiceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    expiresAt: { type: Date },
    scope: { type: String },
  },
  { timestamps: true }
);

UserServiceSchema.index({ userId: 1, serviceId: 1 }, { unique: true });

module.exports = mongoose.model('UserService', UserServiceSchema);