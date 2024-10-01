const googleCalendarActions = require('./googleCalendar/actions');
const googleCalendarReactions = require('./googleCalendar/reactions');
const { getOAuth2Client } = require('./googleCalendar/connection');

module.exports = {
  name: 'Google',
  description: 'Services Google',
  actions: {
    ...googleCalendarActions,
  },
  reactions: {
    ...googleCalendarReactions,
  },
  getOAuth2Client,
};