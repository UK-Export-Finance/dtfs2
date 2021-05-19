const { NotifyClient } = require('notifications-node-client');

const notifyClient = new NotifyClient(process.env.GOV_NOTIFY_API_KEY);

exports.sendEmail = async (req, res) => {
  const {
    templateId,
    sendToEmailAddress,
    emailVariables,
  } = req.body;

  const personalisation = emailVariables;

  const response = await notifyClient
    .sendEmail(templateId, sendToEmailAddress, {
      personalisation,
      reference: null,
    })
    .then((response) => response)
    .catch((err) => {
      console.log(err.stack);
      return false;
    });

  const { status, data } = response;

  return res.status(status).send(data);
};
