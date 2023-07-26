const { NotifyClient } = require('notifications-node-client');
require('dotenv').config();

const notifyClient = new NotifyClient(process.env.GOV_NOTIFY_API_KEY);

const sendEmail = async (templateId, sendToEmailAddress, emailVariables) => {
  const personalisation = emailVariables;

  await notifyClient
    .sendEmail(templateId, sendToEmailAddress, { personalisation, reference: null })
    .then((response) => response)
    .catch((error) => {
      console.error('Portal API - Failed to send email', error?.response.data);
      return { status: error?.response?.status || 500, data: 'Failed to send email' };
    });
};

module.exports = sendEmail;
