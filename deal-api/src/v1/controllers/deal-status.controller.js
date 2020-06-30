const $ = require('mongo-dot-notation');
const moment = require('moment');
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const db = require('../../drivers/db-client');

const { createTypeA } = require('./integration/k2-messages');

const validateStateChange = require('../validation/deal-status');

exports.findOne = (req, res) => {
  findOneDeal(req.params.id, (deal) => {
    if (!deal) {
      res.status(404).send();
    } else if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
    } else {
      res.status(200).send(deal.details.status);
    }
  });
};

const updateStatus = async (collection, _id, from, to) => {
  const statusUpdate = {
    details: {
      previousStatus: from,
      status: to,
      dateOfLastAction: moment().format('YYYY MM DD HH:mm:ss:SSS ZZ'),
    },
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id },
    $.flatten(statusUpdate),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};

const updateComments = async (collection, _id, commentToAdd, user) => {
  const commentToInsert = {
    comments: {
      username: user.username,
      timestamp: moment().format('YYYY MM DD HH:mm:ss:SSS ZZ'),
      text: commentToAdd,
    },
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id },
    { $push: commentToInsert },
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};

const updateFacilityDates = async (collection, deal) => {
  const facilities = {
    bonds: deal.bondTransactions.items,
    loans: deal.loanTransactions.items,
  };

  const updateFacilities = (arr) => {
    arr.forEach((f) => {
      const facility = f;
      const hasRequestedCoverStartDate = (facility['requestedCoverStartDate-day'] && facility['requestedCoverStartDate-month'] && facility['requestedCoverStartDate-year']);

      // TODO: rename bondStage to `facilityStage` (?)
      const shouldUpdateRequestedCoverStartDate = (facility.bondStage === 'Issued' && !hasRequestedCoverStartDate)
        || (facility.facilityStage === 'Unconditional' && !hasRequestedCoverStartDate);

      if (shouldUpdateRequestedCoverStartDate) {
        const now = moment();

        facility['requestedCoverStartDate-day'] = moment(now).format('DD');
        facility['requestedCoverStartDate-month'] = moment(now).format('MM');
        facility['requestedCoverStartDate-year'] = moment(now).format('YYYY');
      }
    });
    return arr;
  };

  const updatedDeal = deal;
  updatedDeal.bondTransactions.items = updateFacilities(facilities.bonds);
  updatedDeal.loanTransactions.items = updateFacilities(facilities.loans);

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: deal._id }, // eslint-disable-line no-underscore-dangle
    $.flatten(updatedDeal),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};

const createSubmissionDate = async (collection, _id) => {
  const submissionDate = {
    details: {
      submissionDate: moment().format('YYY MM DD HH:mm:ss:SSS'),
    },
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id },
    $.flatten(submissionDate),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};

exports.update = (req, res) => {
  const { user } = req;

  findOneDeal(req.params.id, async (deal) => {
    if (!deal) return res.status(404).send();
    if (!userHasAccessTo(req.user, deal)) return res.status(401).send();

    const fromStatus = deal.details.status;
    const toStatus = req.body.status;

    const validationErrors = validateStateChange(deal, req.body, user);

    if (validationErrors) {
      return res.status(200).send({
        success: false,
        ...validationErrors,
      });
    }

    const collection = await db.getCollection('deals');
    const updatedDeal = await updateStatus(collection, req.params.id, fromStatus, toStatus);
    const updatedDealStatus = updatedDeal.details.status;

    const shouldCheckFacilityDates = (fromStatus === 'Draft' && updatedDealStatus === 'Ready for Checker\'s approval');
    if (shouldCheckFacilityDates) {
      await updateFacilityDates(collection, updatedDeal);
    }

    const dealAfterCommentsUpdate = await updateComments(collection, req.params.id, req.body.comments, user);

    if (toStatus === 'Submitted') {
      const dealAfterAllUpdates = await createSubmissionDate(collection, req.params.id);

      // TODO - Reinstate typeA XML creation once Loans and Summary have been added
      const { previousStatus } = deal.details;

      const typeA = await createTypeA(dealAfterAllUpdates, previousStatus);
      if (typeA.errorCount) {
        // TODO - how do we deal with invalid typeA xml?
        return res.status(200).send(typeA);
      }
    }

    const dealAfterAllUpdates = dealAfterCommentsUpdate;

    return res.status(200).send(dealAfterAllUpdates.details.status);
  });
};
