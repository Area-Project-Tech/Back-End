const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const authController = require('../controllers/auth');
const oauth2Client = require('../config/googleAuth');
const tempToken = require('../utils/tempToken');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/google', (req, res) => {
    const state = tempToken.generateTempToken({});
    const scopes = ['profile', 'email'];
  
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
      state: state,
    });
  
    res.redirect(authUrl);
  });
  
router.get('/google/callback', authController.googleCallback);

router.get('/github', passport.authenticate('github-login', { scope: ['read:user', 'user:email'] }));

router.get('/github/callback',
  passport.authenticate('github-login', { failureRedirect: '/login', session: false }),
  authController.generateTokenAndRedirect
);

module.exports = router;