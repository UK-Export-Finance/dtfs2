const { NotifyClient } = require('notifications-node-client');

const notifyClient = new NotifyClient(process.env.GOV_NOTIFY_API_KEY);

exports.sendEmail = async (req, res) => {
  try {
    const {
      templateId,
      sendToEmailAddress,
      emailVariables,
    } = req.body;

    console.log('Calling Notify API. templateId: ', templateId);

    const personalisation = emailVariables;

    const notifyResponse = await notifyClient
      .sendEmail(templateId, sendToEmailAddress, {
        personalisation,
        reference: null,
      })
      .then((response) => response)
      .catch((err) => {
        console.error('Error calling Notify API ', err.response.status);
        return err.response;
      });

    const { status, data } = notifyResponse;

    return res.status(status).send(data);
  } catch (e) {
    console.error('Unable to send email', { e });
  }
  return req.status(422);
};
