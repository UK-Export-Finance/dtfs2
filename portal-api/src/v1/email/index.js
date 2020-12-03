const { NotifyClient } = require('notifications-node-client');

const notifyClient = new NotifyClient(process.env.GOV_NOTIFY_API_KEY);

const sendEmail = async (templateId, sendToEmailAddress, emailVariables) => {
  const personalisation = emailVariables;

  await notifyClient
    .sendEmail(templateId, sendToEmailAddress, {
      personalisation,
      reference: null,
    })
    .then((response) => response)
    .catch((err) => {
      console.log(`Failed to send email to address: ${sendToEmailAddress}`);
      // console.log(err); long, ugly and only so informative..
      console.log(err.stack);
      return false;
    });
};

module.exports = sendEmail;
