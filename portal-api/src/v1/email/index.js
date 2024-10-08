const externalApi = require('../../external-api/api');

const sendEmail = async (templateId, sendToEmailAddress, emailVariables) => {
  try {
    if (!templateId) {
      return { status: 400, data: 'Missing parameter templateId' };
    }
    if (!sendToEmailAddress) {
      return { status: 400, data: 'Missing parameter sendToEmailAddress' };
    }
    if (!emailVariables) {
      return { status: 400, data: 'Missing parameter emailVariables' };
    }
    const emailSent = await externalApi.sendEmail(templateId, sendToEmailAddress, emailVariables);
    return emailSent;
  } catch (error) {
    console.error('Portal API - Failed to send email %o', error?.response?.data);
    return { status: 500, data: 'Failed to send an email' };
  }
};

module.exports = sendEmail;
