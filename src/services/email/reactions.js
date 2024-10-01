const axios = require('axios');
require('dotenv').config();

const sendEmail = async (parameters) => {
  const { to, subject, body } = parameters;

  if (!to || !subject || !body) {
    throw new Error("Email, subject, and message are required fields.");
  }

  const emailData = {
    sender: process.env.EMAIL_USER,
    to: [to],
    subject: subject,
    text_body: body,
  };

  try {
    const response = await axios.post('https://api.smtp2go.com/v3/email/send', emailData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': process.env.SMTP2GO_API_KEY,
        'Accept': 'application/json',
      },
    });

    console.log(`Email envoyé à ${to}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error.response ? error.response.data : error.body);
    throw error;
  }
};

module.exports = {
  sendEmail: {
    handler: sendEmail,
    description: 'Envoie un email au destinataire spécifié',
    schema: {
      to: { type: 'string', required: true },
      subject: { type: 'string', required: true },
      body: { type: 'string', required: true },
    },
  },
};