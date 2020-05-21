const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const moment = require('moment');
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const db = require('../../drivers/db-client');
const validateSubmissionDetails = require('../validation/submission-details');

exports.findOne = (req, res) => {
  findOneDeal(req.params.id, (deal) => {
    if (!deal) {
      res.status(404).send();
    } else if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
    } else {
      const validationErrors = validateSubmissionDetails(deal.submissionDetails);
      res.status(200).json({
        validationErrors,
        data: deal.submissionDetails,
      });
    }
  });
};

const updateSubmissionDetails = async (collection, id, submissionDetails) => {
  const update = {
    submissionDetails,
    details: {
      dateOfLastAction: moment().format('YYYY MM DD HH:mm:ss:SSS ZZ'),
    },
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: { $eq: new ObjectId(id) } },
    $.flatten(update),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};

exports.update = (req, res) => {
  const { user } = req;
  const submissionDetails = req.body;

  findOneDeal(req.params.id, async (deal) => {
    if (!deal) return res.status(404).send();
    if (!userHasAccessTo(user, deal)) return res.status(401).send();

    const validationErrors = validateSubmissionDetails({ ...deal.submissionDetails, ...req.body });

    // if (validationErrors.count === 0) {
    //   submissionDetails.status = 'Completed';
    // } else {
    submissionDetails.status = 'Incomplete';
    // }

    const collection = await db.getCollection('deals');
    const dealAfterAllUpdates = await updateSubmissionDetails(collection, req.params.id, submissionDetails);

    const response = {
      validationErrors,
      data: dealAfterAllUpdates.submissionDetails,
    };

    return res.status(200).json(response);
  });
};
