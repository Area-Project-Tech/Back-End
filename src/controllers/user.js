const User = require('../models/user');
const passport = require('../config/passport');
const UserService = require('../models/userService');
const Service = require('../models/service');
const bcrypt = require('bcryptjs');

exports.getLoginInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -providers.accessToken -providers.refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.passwordHash = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.setPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
    await user.save();

    res.status(200).json({ message: 'Password set successfully' });
  } catch (error) {
    next(error);
  }
};

exports.linkProvider = async (req, res, next) => {
  try {
    const { provider, accessToken, refreshToken } = req.body;
    const userId = req.user.id;

    const service = await Service.findOne({ name: provider });
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    let userService = await UserService.findOne({ userId, serviceId: service._id });
    if (userService) {
      userService.accessToken = accessToken;
      userService.refreshToken = refreshToken;
    } else {
      userService = new UserService({
        userId,
        serviceId: service._id,
        accessToken,
        refreshToken,
      });
    }

    await userService.save();

    res.status(200).json({ message: 'Provider lié avec succès' });
  } catch (error) {
    next(error);
  }
};

exports.unlinkProvider = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const userId = req.user.id;

    const service = await Service.findOne({ name: provider });
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    const result = await UserService.findOneAndDelete({ userId, serviceId: service._id });
    if (!result) {
      return res.status(404).json({ message: 'Connexion au service non trouvée' });
    }

    res.status(200).json({ message: 'Provider délié avec succès' });
  } catch (error) {
    next(error);
  }
};
