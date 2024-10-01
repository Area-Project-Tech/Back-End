const Service = require('../models/service');
const UserService = require('../models/userService');
const ServiceAction = require('../models/serviceAction');
const ServiceReaction = require('../models/serviceReaction');
const passport = require('passport');
const dotenv = require('dotenv');
const tempToken = require('../utils/tempToken');
const { google } = require('googleapis');

dotenv.config();

exports.getServices = async (req, res, next) => {
  try {
    const services = await Service.find().populate('actions').populate('reactions');
    res.status(200).json({ services });
  } catch (error) {
    next(error);
  }
};

exports.getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('actions').populate('reactions');
    if (!service)
      return res.status(404).json({ message: 'Service not found' });
    res.status(200).json({ service });
  } catch (error) {
    next(error);
  }
};

exports.getUserServices = async (req, res, next) => {
  try {
    const userServices = await UserService.find({ userId: req.user.id }).populate('serviceId');
    res.status(200).json({ userServices });
  } catch (error) {
    next(error);
  }
};

exports.getServiceActions = async (req, res, next) => {
  try {
    const actions = await ServiceAction.find({ serviceId: req.params.id });
    res.status(200).json({ actions });
  } catch (error) {
    next(error);
  }
};

exports.getServiceReactions = async (req, res, next) => {
  try {
    const reactions = await ServiceReaction.find({ serviceId: req.params.id });
    res.status(200).json({ reactions });
  } catch (error) {
    next(error);
  }
};

exports.connectGoogle = (req, res) => {
  const tempTokenValue = tempToken.generateTempToken({ userId: req.user.id });
  const scopes = ['https://www.googleapis.com/auth/calendar'];

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BACKEND_URL}/api/service/connect/google/callback`
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
    state: tempTokenValue,
  });

  res.redirect(authUrl);
};

exports.handleGoogleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    const tempTokenData = tempToken.verifyTempToken(state);
    if (!tempTokenData || !tempTokenData.userId) {
      return res.status(400).send('Token temporaire invalide ou expiré');
    }

    const userId = tempTokenData.userId;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/api/service/connect/google/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);

    const service = await Service.findOne({ name: 'Google' });
    if (!service) {
      return res.status(404).send('Service non trouvé');
    }

    let userService = await UserService.findOne({ userId, serviceId: service._id });

    if (!userService) {
      userService = new UserService({
        userId,
        serviceId: service._id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope,
      });
    } else {
      userService.accessToken = tokens.access_token;
      userService.refreshToken = tokens.refresh_token || userService.refreshToken;
      userService.expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : null;
      userService.scope = tokens.scope;
    }

    await userService.save();

    res.redirect(`${process.env.FRONTEND_URL}/service-connected?service=google`);
  } catch (error) {
    console.error('Erreur lors du callback Google OAuth2 :', error);
    res.status(500).send('Erreur lors de la connexion du service Google');
  }
};

exports.connectGithub = (req, res, next) => {
  const tempTokenValue = tempToken.generateTempToken({ userId: req.user.id });
  passport.authenticate('github-service', {
    scope: ['repo', 'user:email'],
    state: tempTokenValue,
  })(req, res, next);
};

exports.handleGithubCallback = (req, res, next) => {
  passport.authenticate('github-service', { failureRedirect: '/profile', session: false }, (err, user, info) => {
    if (err || !user) {
      console.error('Erreur lors de la connexion du service GitHub:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/profile?error=auth_failed`);
    }
    res.redirect(`${process.env.FRONTEND_URL}/service-connected?service=github`);
  })(req, res, next);
};

exports.connectOpenAI = async (req, res, next) => {
  try {
    const service = await Service.findOne({ name: 'OpenAI' });
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ message: 'API Key requise pour se connecter à OpenAI' });
    }

    await UserService.create({
      userId: req.user.id,
      serviceId: service._id,
      accessToken: apiKey,
    });

    res.status(200).json({ message: 'Connecté avec succès à OpenAI' });
  } catch (error) {
    next(error);
  }
};

exports.disconnectService = async (req, res, next) => {
  try {
    const { serviceName } = req.params;
    const formattedServiceName = serviceName.toLowerCase().replace(/_/g, ' ');

    const service = await Service.findOne({ name: { $regex: new RegExp(formattedServiceName, 'i') } });
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    const userService = await UserService.findOneAndDelete({ userId: req.user.id, serviceId: service._id });
    if (!userService) {
      return res.status(404).json({ message: 'Connexion au service non trouvée' });
    }

    res.status(200).json({ message: `Déconnecté avec succès du service ${service.name}` });
  } catch (error) {
    next(error);
  }
};
