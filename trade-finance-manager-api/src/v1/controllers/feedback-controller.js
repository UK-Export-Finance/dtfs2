const { format, getUnixTime, fromUnixTime } = require('date-fns');

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
    ...req.body.formData,
    created: getUnixTime(new Date()),
    submittedByUserName: req.body.userDetails.username,
    submittedByUserEmail: req.body.userDetails.email,
  };

  const collection = await db.getCollection('tfm-feedback');
  const createdFeedback = await collection.insertOne(modifiedFeedback);

  // get formatted date from created timestamp, to display in email
  const formattedCreated = format(fromUnixTime(modifiedFeedback.created), 'dd/MM/yyyy HH:mm');

  const {
    role,
    team,
    whyUsingService,
    easyToUse,
    satisfied,
    howCanWeImprove,
    emailAddress,
    submittedByUserName,
    submittedByUserEmail,
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
    submittedByUserName,
    submittedByUserEmail,
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
