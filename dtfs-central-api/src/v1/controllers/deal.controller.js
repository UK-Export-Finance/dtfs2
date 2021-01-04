const db = require('../../drivers/db-client');
const DEFAULTS = require('../defaults');
const now = require('../../now');
const getDealErrors = require('../validation/create-deal');
const { findEligibilityCriteria } = require('./eligibility-criteria.controller');
const { generateDealId } = require('../../utils/generate-ids');

const fillInEligibilityCriteria = (criterias, answers) => criterias.map((criteria) => {
  const matchingAnswer = answers ? answers.find((answer) => answer.id === criteria.id) : null;
  if (!matchingAnswer) {
    return criteria;
  }
  return {
    ...criteria,
    ...matchingAnswer,
  };
});

const createDealEligibility = async (eligibility) => {
  const beingGivenEligibility = (eligibility && eligibility.criteria);
  const eligibilityCriteria = await findEligibilityCriteria();

  // if we're being asked to create a deal and being given an eligibility block
  // use details out of the eligibility block over the details we get from the API
  const eligibilityCriteriaWithAnswers = beingGivenEligibility
    ? fillInEligibilityCriteria(eligibilityCriteria, eligibility.criteria)
    : eligibilityCriteria;

  const eligibilityStatus = eligibility && eligibility.status
    ? eligibility.status
    : DEFAULTS.DEALS.eligibility.status;

  const eligibilityCriteria11AgentDetails = () => {
    if (beingGivenEligibility) {
      const { criteria, status, ...eligibilityAgentDetails } = eligibility;
      return eligibilityAgentDetails;
    }
    return null;
  };

  return {
    status: eligibilityStatus,
    criteria: eligibilityCriteriaWithAnswers,
    ...eligibilityCriteria11AgentDetails(),
  };
};

const createDeal = async (req, res) => {
  const collection = await db.getCollection('deals');
  const dealId = await generateDealId();
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
      // owningBank: req.user.bank,
    },
    eligibility: await createDealEligibility(req.body.eligibility),
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

exports.createDealPost = async (req, res) => {
  const result = await createDeal(req, res);
  return result;
};

const queryDeals = async (query, start = 0, pagesize = 0) => {
  const collection = await db.getCollection('deals');
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
exports.queryDeals = queryDeals;

exports.queryDealsPost = async (req, res) => {
  const deals = await queryDeals(req.body.query, req.body.start, req.body.pagesize);
  res.status(200).send(deals);
};

const findOneDeal = async (_id, callback) => {
  const collection = await db.getCollection('deals');
  const deal = await collection.findOne({ _id });

  if (callback) {
    callback(deal);
  }

  return deal;
};
exports.findOneDeal = findOneDeal;

exports.findOneDealGet = async (req, res) => {
  const deal = await findOneDeal(req.params.id);
  res.status(200).send({
    deal,
  });
};
