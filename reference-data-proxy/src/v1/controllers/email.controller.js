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

  const notifyResponse = await notifyClient
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
      console.log(err.response);
      return err.response;
    });

  const { status, data } = notifyResponse;

  return res.status(status).send(data);
};
