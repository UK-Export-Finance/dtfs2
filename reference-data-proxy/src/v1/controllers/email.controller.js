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
    .then((response) => response)
    .catch((err) => {
      console.error('Error calling Notify API ', { err: { err } });
      //   Sentry.captureException(err);
      return err.response;
    });

  const { status, data } = notifyResponse;

  return res.status(status).send(data);
};
