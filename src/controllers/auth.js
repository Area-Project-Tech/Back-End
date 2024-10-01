const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const oauth2Client = require('../config/googleAuth');

exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email déjà utilisé' });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      passwordHash,
      name,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ message: 'Utilisateur enregistré avec succès', token, userId: user._id });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) return res.status(400).json({ message: 'Identifiants invalides' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Identifiants invalides' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    next(error);
  }
};

exports.generateTokenAndRedirect = (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
};

exports.googleCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = require('googleapis').google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;
    const name = userInfo.data.name;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name });
    }

    const providerId = userInfo.data.id;
    const providerExists = user.providers.some(
      (provider) => provider.providerName === 'google' && provider.providerId === providerId
    );

    if (!providerExists) {
      user.providers.push({
        providerName: 'google',
        providerId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
    } else {
      user.providers = user.providers.map((provider) => {
        if (provider.providerName === 'google' && provider.providerId === providerId) {
          provider.accessToken = tokens.access_token;
          provider.refreshToken = tokens.refresh_token || provider.refreshToken;
        }
        return provider;
      });
    }

    await user.save();

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${jwtToken}`);
  } catch (error) {
    console.error('Erreur lors du callback Google OAuth2 :', error);
    res.status(500).send('Erreur lors de l\'authentification avec Google');
  }
};
