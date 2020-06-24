const $ = require('mongo-dot-notation');
const moment = require('moment');
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const db = require('../../drivers/db-client');
const validateSubmissionDetails = require('../validation/submission-details');
const { sanitizeCurrency } = require('../../utils/number');

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

const updateSubmissionDetails = async (collection, _id, submissionDetails) => {
  const update = {
    submissionDetails,
    details: {
      dateOfLastAction: moment().format('YYYY MM DD HH:mm:ss:SSS ZZ'),
    },
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id },
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

    // TODO - we calculate status on the fly now, so should we ever persist this field?
    // if (validationErrors.count === 0) {
    //   submissionDetails.status = 'Completed';
    // } else {
    submissionDetails.status = 'Incomplete';
    // }

    // build a date out of the conversion-date fields if we have them
    const day = submissionDetails['supplyContractConversionDate-day'];
    const month = submissionDetails['supplyContractConversionDate-month'];
    const year = submissionDetails['supplyContractConversionDate-year'];
    if (day && month && year) {
      submissionDetails.supplyContractConversionDate = `${day}/${month}/${year}`;
    }

    const sanitizedSupplyContractValue = sanitizeCurrency(submissionDetails.supplyContractValue);
    if (sanitizedSupplyContractValue.isCurrency) {
      submissionDetails.supplyContractValue = sanitizedSupplyContractValue.sanitizedValue;
    }

    const collection = await db.getCollection('deals');
    const dealAfterAllUpdates = await updateSubmissionDetails(collection, req.params.id, submissionDetails);

    const response = {
      validationErrors,
      data: dealAfterAllUpdates.submissionDetails,
    };

    return res.status(200).json(response);
  });
};
