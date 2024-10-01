const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

passport.use('github-login',
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let email = null;
        const name = profile.displayName || profile.username;
        const providerId = profile.id;

        const emailsRes = await axios.get('https://api.github.com/user/emails', {
          headers: { Authorization: `token ${accessToken}` },
        });

        const emails = emailsRes.data;
        if (emails && emails.length > 0) {
          email = emails.find((emailObj) => emailObj.primary && emailObj.verified)?.email || emails[0].email;
        }

        if (!email) {
          return done(new Error('Email non disponible'), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({ email, name, providers: [] });
        }

        const providerExists = user.providers.some(
          (provider) => provider.providerName === 'github' && provider.providerId === providerId
        );

        if (!providerExists) {
          user.providers.push({
            providerName: 'github',
            providerId,
            accessToken,
            refreshToken,
          });
        } else {
          user.providers = user.providers.map((provider) => {
            if (provider.providerName === 'github' && provider.providerId === providerId) {
              provider.accessToken = accessToken;
              provider.refreshToken = refreshToken || provider.refreshToken;
            }
            return provider;
          });
        }

        await user.save();

        return done(null, user);
      } catch (error) {
        console.error('Erreur dans la stratégie github-login:', error);
        return done(error, null);
      }
    }
  )
);

passport.use('github-service',
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/service/connect/github/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const state = req.query.state;
        const tempTokenData = tempToken.verifyTempToken(state);
        if (!tempTokenData || !tempTokenData.userId) {
          return done(new Error('Token temporaire invalide ou expiré'), null);
        }

        const userId = tempTokenData.userId;

        const service = await Service.findOne({ name: 'GitHub' });
        if (!service) {
          return done(new Error('Service non trouvé'), null);
        }

        let userService = await UserService.findOne({ userId, serviceId: service._id });

        if (!userService) {
          userService = new UserService({
            userId,
            serviceId: service._id,
            accessToken,
            refreshToken,
          });
        } else {
          userService.accessToken = accessToken;
          userService.refreshToken = refreshToken || userService.refreshToken;
        }

        await userService.save();

        return done(null, req.user);
      } catch (error) {
        console.error('Erreur dans la stratégie github-service:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;