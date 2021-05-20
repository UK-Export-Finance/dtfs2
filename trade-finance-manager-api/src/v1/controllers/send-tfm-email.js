const api = require('../api');

const sendTfmEmail = async (
  templateId,
  sendToEmailAddress,
  emailVariables,
) => {
  const response = await api.sendEmail(
    templateId,
    sendToEmailAddress,
    emailVariables,
  );

  return response;

  // TODO: update deal history
};

module.exports = sendTfmEmail;
