const { google } = require('googleapis');

const listEvents = async (parameters, context) => {
  const { maxResults = 10 } = parameters;

  const oauth2Client = context.oauth2Client;
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.events.list({
    calendarId: 'primary',
    maxResults: maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });

  console.log(response.data.items);
  return response.data.items;
};

module.exports = {
  listEvents: {
    handler: listEvents,
    schema: {
      maxResults: { type: 'number', required: false, default: 10 },
    },
  },
};