const assert = require('assert');
const $ = require('mongo-dot-notation');

const DEFAULTS = require('../defaults');
const db = require('../../drivers/db-client');
const getDealErrors = require('../validation/deal');
const now = require('../../now');
const { isSuperUser, userHasAccessTo } = require('../users/checks');
const { generateDealId } = require('../../utils/generateIds');
const validate = require('../validation/completeDealValidation');
const calculateStatuses = require('../section-status/calculateStatuses');
const calculateDealSummary = require('../deal-summary');
const { findEligibilityCriteria } = require('./eligibilityCriteria.controller');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id; // eslint-disable-line no-underscore-dangle
  return cleanedObject;
};

const dealsQuery = (user, filter) => {
  // add the bank clause if we're not a superuser
  if (!isSuperUser(user)) {
    filter.push({ 'details.owningBank.id': { $eq: user.bank.id } });
  }

  // swap out the 'details.bankSupplyContractID' for an equivalent regex
  //  [dw] rushing a bit, but my instinct is that if we have to do this,
  //       we likely should be fixing this in the portal so we send a
  //       $regex query in the first instance, but i could be wrong.
  filter.map((clause) => {
    if (clause['details.bankSupplyContractID']) {
      const bankSupplyContractID = clause['details.bankSupplyContractID'];
      return { 'details.bankSupplyContractID': { $regex: bankSupplyContractID, $options: 'i' } };
    }
    return clause;
  });

  let result = {};
  if (filter.length === 1) {
    result = filter.pop(); // lint didn't like filter[0]..
  } else if (filter.length > 1) {
    result = {
      $and: filter,
    };
  }

  return result;
};

const findDeals = async (requestingUser, filter) => {
  const collection = await db.getCollection('deals');

  const dealResults = collection.find(dealsQuery(requestingUser, filter));

  const count = await dealResults.count();
  const deals = await dealResults
    .sort({ 'details.dateOfLastAction': -1 })
    .toArray();

  return {
    count,
    deals,
  };
};
exports.findDeals = findDeals;

const findPaginatedDeals = async (requestingUser, start = 0, pagesize = 20, filter) => {
  const collection = await db.getCollection('deals');

  const query = dealsQuery(requestingUser, filter);
  const dealResults = collection.find(query);

  const count = await dealResults.count();
  const deals = await dealResults
    .sort({ 'details.dateOfLastAction': -1 })
    .skip(start)
    .limit(pagesize)
    .toArray();

  return {
    count,
    deals,
  };
};
exports.findPaginatedDeals = findPaginatedDeals;

const findOneDeal = async (_id, callback) => {
  const collection = await db.getCollection('deals');
  if (callback) {
    collection.findOne({ _id }, (err, result) => {
      assert.equal(err, null);
      callback(result);
    });
  }
  return collection.findOne({ _id });
};
exports.findOneDeal = findOneDeal;

const fillInEligibilityCriteria = (criterias, answers) => criterias.map((criteria) => {
  const matchingAnswer = answers.find((answer) => answer.id === criteria.id);
  if (!matchingAnswer) {
    return criteria;
  }
  return {
    ...criteria,
    ...matchingAnswer,
  };
});

const createDeal = async (req, res) => {
  const collection = await db.getCollection('deals');
  const eligibilityCriteria = await findEligibilityCriteria();
  const dealId = await generateDealId();

  const beingGivenEligibility = (req.body.eligibility && req.body.eligibility.criteria);

  // if we're being asked to create a deal and being given an eligibility block
  //  use details out of the eligibility block over the details we get from the API
  const eligibilityCriteriaWithAnswers = beingGivenEligibility
    ? fillInEligibilityCriteria(eligibilityCriteria, req.body.eligibility.criteria)
    : eligibilityCriteria;

  const eligibilityStatus = req.body.eligibility && req.body.eligibility.status
    ? req.body.eligibility.status
    : DEFAULTS.DEALS.eligibility.status;

  const time = now();
  const newDeal = {
    _id: dealId,
    ...DEFAULTS.DEALS,
    ...req.body,
    details: {
      ...DEFAULTS.DEALS.details,
      ...req.body.details,
      created: time,
      dateOfLastAction: time,
      maker: req.user,
      owningBank: req.user.bank,
    },
    eligibility: {
      status: eligibilityStatus,
      criteria: eligibilityCriteriaWithAnswers,
    },
  };

  const validationErrors = getDealErrors(newDeal);

  if (validationErrors.count !== 0) {
    return res.status(400).send({
      ...newDeal,
      validationErrors,
    });
  }

  const response = await collection.insertOne(newDeal);

  const createdDeal = response.ops[0];
  return res.status(200).send(createdDeal);
};

exports.create = async (req, res) => {
  const result = await createDeal(req, res);
  return result;
};

exports.findOne = (req, res) => {
  findOneDeal(req.params.id, (deal) => {
    if (!deal) {
      res.status(404).send();
    } else if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
    } else {
      // apply realtime validation so we catch any time-dependent fields
      //  that have -become- invalid..
      const validationErrors = validate(deal);
      const dealWithStatuses = calculateStatuses(deal, validationErrors);

      const dealWithSummary = {
        ...dealWithStatuses,
        summary: calculateDealSummary(deal),
      };

      res.status(200).send({
        deal: dealWithSummary,
        validationErrors,
      });
    }
  });
};

const handleEditedBy = async (req) => {
  let editedBy = [];

  // sometimes we don't have a user making changes.
  // eg we can get new data from type-b XML/workflow.
  if (req.user) {
    const {
      username,
      roles,
      bank,
      _id,
    } = req.user;

    const newEditedBy = {
      date: now(),
      username,
      roles,
      bank,
      userId: _id,
    };

    // if partial update
    // need to make sure that we have all existing entries in `editedBy`.
    // ideally we could refactor, perhaps, so that no partial updates are allowed.
    // but for now...
    if (!req.body.editedBy) {
      await findOneDeal(req.params.id, (deal) => {
        editedBy = [
          ...deal.editedBy,
          newEditedBy,
        ];
      });
    } else {
      editedBy = [
        ...req.body.editedBy,
        newEditedBy,
      ];
    }
  }

  return editedBy;
};

const updateDeal = async (req) => {
  const collection = await db.getCollection('deals');

  const editedBy = await handleEditedBy(req);

  const update = {
    ...req.body,
    details: {
      ...req.body.details,
      dateOfLastAction: now(),
    },
    editedBy,
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: req.params.id },
    $.flatten(withoutId(update)),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};
exports.updateDeal = updateDeal;

exports.update = async (req, res) => {
  await findOneDeal(req.params.id, async (deal) => {
    if (!deal) res.status(404).send();

    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      } else {
        const updatedDeal = await updateDeal(req);
        res.status(200).json(updatedDeal);
      }
    }
    res.status(404).send();
  });
};

exports.delete = async (req, res) => {
  findOneDeal(req.params.id, async (deal) => {
    if (!deal) res.status(404).send();

    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      } else {
        const collection = await db.getCollection('deals');
        const status = await collection.deleteOne({ _id: req.params.id });
        res.status(200).send(status);
      }
    }
  });
};
