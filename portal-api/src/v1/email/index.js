const externalApi = require('../../external-api/api');

const sendEmail = async (templateId, sendToEmailAddress, emailVariables) => {
  try {
    const emailSent = await externalApi.sendEmail(templateId, sendToEmailAddress, emailVariables);
    return emailSent;
  } catch (error) {
    console.error('Portal API - Failed to send email %o', error?.response?.data);
    return { status: 500, data: 'Failed to send an email' };
  }
};

module.exports = sendEmail;
