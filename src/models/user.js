const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ProviderSchema = new mongoose.Schema({
  providerName: { type: String, required: true },
  providerId: { type: String, required: true },
  accessToken: { type: String },
  refreshToken: { type: String },
  tokenExpiry: { type: Date },
});

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true},
    passwordHash: { type: String },
    name: { type: String },
    providers: [ProviderSchema],
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = mongoose.model('User', UserSchema);