const { google } = require('googleapis');

const getOAuth2Client = (credentials) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials(credentials);
  return oauth2Client;
};

module.exports = {
  getOAuth2Client,
};