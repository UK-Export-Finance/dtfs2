const { ObjectId } = require('mongodb');
const assert = require('assert');
const { format, getUnixTime, fromUnixTime } = require('date-fns');

const db = require('../../drivers/db-client');
const validateFeedback = require('../validation/feedback');
const sendEmail = require('../email');

const findFeedbacks = async (callback) => {
  const collection = await db.getCollection('feedback');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneFeedback = async (id, callback) => {
  const collection = await db.getCollection('feedback');

  collection.findOne({ _id: ObjectId(id) }, (err, result) => {
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
    created: getUnixTime(new Date()),
  };

  const collection = await db.getCollection('feedback');
  const createdFeedback = await collection.insertOne(modifiedFeedback);

  // get formatted date from created timestamp, to display in email
  const formattedCreated = format(fromUnixTime(modifiedFeedback.created), 'dd/MM/yyyy HH:mm');

  const {
    role,
    organisation,
    reasonForVisiting,
    reasonForVisitingOther,
    easyToUse,
    clearlyExplained,
    satisfied,
    howCanWeImprove,
    emailAddress,
    submittedBy
  } = modifiedFeedback;

  const emailVariables = {
    role,
    organisation,
    reasonForVisiting,
    reasonForVisitingOther,
    easyToUse,
    clearlyExplained,
    satisfied,
    howCanWeImprove,
    emailAddress,
    created: formattedCreated,
    submittedBy
  };

  const EMAIL_TEMPLATE_ID = '4214bdb8-b3f5-4081-a664-3bfcfe648b8d';
  const EMAIL_RECIPIENT = process.env.GOV_NOTIFY_EMAIL_RECIPIENT;

  await sendEmail(
    EMAIL_TEMPLATE_ID,
    EMAIL_RECIPIENT,
    emailVariables,
  );

  return res.status(200).send({ _id: createdFeedback.insertedId });
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
    const status = await collection.deleteOne({ _id: ObjectId(req.params.id) });
    return res.status(200).send(status);
  });
};
