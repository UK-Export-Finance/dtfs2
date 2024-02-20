const { NotifyClient } = require('notifications-node-client');
const { inspect } = require('util');
require('dotenv').config();

const notifyClient = new NotifyClient(process.env.GOV_NOTIFY_API_KEY);

const sendEmail = async (templateId, sendToEmailAddress, emailVariables) => {
  const personalisation = emailVariables;

  try {
    console.info('*** ATTEMPTING TO SEND EMAIL ***');
    const response = await notifyClient.sendEmail(templateId, sendToEmailAddress, { personalisation, reference: null });
    console.info('🎉 successfully sent email!!!', inspect(response, { showHidden: false, depth: null, colors: true }));
    return response;
  } catch (error) {
    console.error('Portal API - Failed to send email %o', error?.response?.data);
    return { status: 500, data: 'Failed to send an email' };
  }
};

module.exports = sendEmail;
