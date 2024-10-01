const jwt = require('jsonwebtoken');

const TEMP_TOKEN_SECRET = process.env.TEMP_TOKEN_SECRET || 'votre_secret_temporaire';

exports.generateTempToken = (data) => {
  return jwt.sign(data, TEMP_TOKEN_SECRET, { expiresIn: '15m' });
};

exports.verifyTempToken = (token) => {
  try {
    return jwt.verify(token, TEMP_TOKEN_SECRET);
  } catch (error) {
    console.error('Erreur de vérification du token temporaire:', error);
    return null;
  }
};