const moment = require('moment');

const db = require('../../drivers/db-client');
const validateFeedback = require('../validation/feedback');
const sendTfmEmail = require('./send-tfm-email');

exports.create = async (req, res) => {
  const validationErrors = validateFeedback(req.body);

  if (validationErrors.count !== 0) {
    return res.status(400).send({
      feedback: req.body,
      validationErrors,
    });
  }

  const modifiedFeedback = {
    ...req.body,
    created: moment().unix(),
    submittedBy: req.query ? req.query.username : null,
  };

  const collection = await db.getCollection('tfm-feedback');
  const createdFeedback = await collection.insertOne(modifiedFeedback);

  // get formatted date from created timestamp, to display in email
  const formattedCreated = moment.unix(modifiedFeedback.created).format('DD/MM/YYYY HH:mm');

  const {
    role,
    team,
    whyUsingService,
    easyToUse,
    satisfied,
    howCanWeImprove,
    emailAddress,
    submittedBy,
  } = modifiedFeedback;

  const emailVariables = {
    role,
    team,
    whyUsingService,
    easyToUse,
    satisfied,
    howCanWeImprove,
    emailAddress,
    created: formattedCreated,
    submittedBy,
  };

  const EMAIL_TEMPLATE_ID = '4214bdb8-b3f5-4081-a664-3bfcfe648b8d';
  const EMAIL_RECIPIENT = process.env.GOV_NOTIFY_EMAIL_RECIPIENT;

  await sendTfmEmail(
    EMAIL_TEMPLATE_ID,
    EMAIL_RECIPIENT,
    emailVariables,
  );

  return res.status(200).send({ _id: createdFeedback.insertedId });
};
