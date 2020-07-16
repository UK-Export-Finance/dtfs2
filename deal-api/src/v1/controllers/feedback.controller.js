const { ObjectID } = require('mongodb');
const assert = require('assert');
const { NotifyClient } = require('notifications-node-client');
const validateFeedback = require('../validation/feedback');
const now = require('../../now');

const notifyClient = new NotifyClient(process.env.GOV_NOTIFY_API_KEY);

const db = require('../../drivers/db-client');

const sendFeedbackEmail = async (templateId, sendToEmailAddress, emailVariables) => {
  const personalisation = emailVariables;

  await notifyClient
    .sendEmail(templateId, sendToEmailAddress, {
      personalisation,
      reference: null,
    })
    .then((response) => response)
    .catch((err) => {
      console.log(err);
    });
};

const findFeedbacks = async (callback) => {
  const collection = await db.getCollection('feedback');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneFeedback = async (id, callback) => {
  const collection = await db.getCollection('feedback');

  collection.findOne({ _id: new ObjectID(id) }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

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
    created: now()
  };

  const collection = await db.getCollection('feedback');
  const response = await collection.insertOne(modifiedFeedback);

  const createdFeedback = response.ops[0];

  const {
    role,
    organisation,
    reasonForVisiting,
    easyToUse,
    clearlyExplained,
    satisfied,
    howCanWeImprove,
    emailAddress,
    created,
  } = modifiedFeedback;

  const emailVariables = {
    date_of_submission: 'mock date',
    role,
    organisation,
    reasonForVisiting,
    easyToUse,
    clearlyExplained,
    satisfied,
    howCanWeImprove,
    emailAddress,
    created,
  };

  const EMAIL_TEMPLATE_ID = '4214bdb8-b3f5-4081-a664-3bfcfe648b8d';
  // const EMAIL_RECIPIENT = 'no.reply@ukexportfinance.gov.uk';
  const EMAIL_RECIPIENT = process.env.GOV_NOTIFY_EMAIL_RECIPIENT;

  await sendFeedbackEmail(
    EMAIL_TEMPLATE_ID,
    EMAIL_RECIPIENT,
    emailVariables,
  );

  return res.status(200).send(createdFeedback);
};

exports.findOne = (req, res) => (
  findOneFeedback(req.params.id, (feedback) => {
    if (!feedback) {
      res.status(404).send();
    } else {
      return res.status(200).send(feedback);
    }
    return res.status(404).send();
  })
);

exports.findAll = (req, res) => (
  findFeedbacks((feedbacks) => res.status(200).send(feedbacks)));

exports.delete = async (req, res) => {
  findOneFeedback(req.params.id, async (feedback) => {
    if (!feedback) {
      return res.status(404).send();
    }
    const collection = await db.getCollection('feedback');
    const status = await collection.deleteOne({ _id: new ObjectID(req.params.id) });
    return res.status(200).send(status);
  });
};
