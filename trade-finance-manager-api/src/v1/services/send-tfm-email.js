const api = require('../api');

const sendTfmEmail = async (templateId, sendToEmailAddress, emailVariables) => {
  const emailResponse = await api.sendEmail(templateId, sendToEmailAddress, emailVariables);

  return emailResponse;
};

module.exports = sendTfmEmail;
