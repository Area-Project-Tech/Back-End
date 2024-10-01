const { google } = require('googleapis');

const createEvent = async (parameters, context) => {
  const { summary, description, startDateTime, endDateTime, attendees } = parameters;
  const oauth2Client = context.oauth2Client;
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary,
    description,
    start: {
      dateTime: startDateTime,
      timeZone: 'UTC',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'UTC',
    },
    attendees: attendees ? attendees.map(email => ({ email })) : [],
  };

  const res = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });

  return res.data;
};

module.exports = {
  createEvent: {
    handler: createEvent,
    description: 'Crée un événement dans le calendrier Google',
    schema: {
      summary: { type: 'string', required: true, description: 'Titre de l\'événement' },
      description: { type: 'string', required: false, description: 'Description de l\'événement' },
      startDateTime: { type: 'string', required: true, description: 'Date et heure de début (ISO 8601)' },
      endDateTime: { type: 'string', required: true, description: 'Date et heure de fin (ISO 8601)' },
      attendees: { type: 'array', required: false, description: 'Liste des emails des participants' },
    },
  },
};