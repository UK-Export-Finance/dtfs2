const { NotifyClient } = require('notifications-node-client');

const notifyClient = new NotifyClient(process.env.GOV_NOTIFY_API_KEY);

exports.sendEmail = async (req, res) => {
  const {
    templateId,
    sendToEmailAddress,
    emailVariables,
  } = req.body;

  console.log('Calling Notify API');

  const personalisation = emailVariables;

  const response = await notifyClient
    .sendEmail(templateId, sendToEmailAddress, {
      personalisation,
      reference: null,
    })
    .then((response) => {
      console.log(`Sent Notify email to ${sendToEmailAddress} with templateId ${templateId}`);
      return response;
    })
    .catch((err) => {
      console.log('Error calling Notify API');
      console.log(err.stack);
      return false;
    });

  const { status, data } = response;

  return res.status(status).send(data);
};
