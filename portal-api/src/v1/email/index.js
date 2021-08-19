const { NotifyClient } = require('notifications-node-client');

const notifyClient = new NotifyClient(process.env.GOV_NOTIFY_API_KEY);

const sendEmail = async (templateId, sendToEmailAddress, emailVariables) => {
  const personalisation = emailVariables;

  console.log('Calling Notify API');

  await notifyClient
    .sendEmail(templateId, sendToEmailAddress, {
      personalisation,
      reference: null,
    })
    .then((response) => {
      console.log(`Sent Notify email to ${sendToEmailAddress} with templateId ${templateId}`);
      return response;
    })
    .catch((err) => {
      console.log(`Failed to send email to address: ${sendToEmailAddress} with templateId ${templateId}`);
      return err.response;
    });
};

module.exports = sendEmail;
