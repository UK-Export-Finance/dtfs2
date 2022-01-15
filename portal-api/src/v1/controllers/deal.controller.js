const DEFAULTS = require('../defaults');
const db = require('../../drivers/db-client');
const getDealErrors = require('../validation/deal');
const { isSuperUser, userHasAccessTo } = require('../users/checks');
const validate = require('../validation/completeDealValidation');
const calculateStatuses = require('../section-status/calculateStatuses');
const calculateDealSummary = require('../deal-summary');
const { findEligibilityCriteria } = require('./eligibilityCriteria.controller');
const api = require('../api');

const dealsQuery = (user, filter) => {
  // add the bank clause if we're not a superuser
  if (!isSuperUser(user)) {
    filter.push({ 'bank.id': { $eq: user.bank.id } });
  }

  // swap out the 'bankInternalRefName' for an equivalent regex
  //  [dw] rushing a bit, but my instinct is that if we have to do this,
  //       we likely should be fixing this in the portal so we send a
  //       $regex query in the first instance, but i could be wrong.
  const amendedFilters = filter.map((clause) => {
    if (clause.freetextSearch) {
      const { freetextSearch } = clause;
      return {
        $or: [
          { bankInternalRefName: { $regex: freetextSearch, $options: 'i' } },
          { 'details.ukefDealId': { $regex: freetextSearch, $options: 'i' } },
          { 'bondTransactions.items.uniqueIdentificationNumber': { $regex: freetextSearch, $options: 'i' } },
          { 'submissionDetails.supplier-name': { $regex: freetextSearch, $options: 'i' } },
          { 'submissionDetails.supplier-companies-house-registration-number': { $regex: freetextSearch, $options: 'i' } },
          { 'submissionDetails.indemnifier-name': { $regex: freetextSearch, $options: 'i' } },
          { 'submissionDetails.indemnifier-companies-house-registration-number': { $regex: freetextSearch, $options: 'i' } },
          { 'submissionDetails.buyer-name': { $regex: freetextSearch, $options: 'i' } },
        ],
      };
    }

    if (clause['transaction.status']) {
      const bondMatchesOnFacilityStage = { 'bondTransactions.items': { $elemMatch: { status: clause['transaction.status'] } } };
      const loanMatchesOnFacilityStage = { 'loanTransactions.items': { $elemMatch: { status: clause['transaction.status'] } } };
      return { $or: [bondMatchesOnFacilityStage, loanMatchesOnFacilityStage] };
    }

    if (clause.bankInternalRefName) {
      const { bankInternalRefName } = clause;

      return {
        $or: [
          { bankInternalRefName: { $regex: bankInternalRefName, $options: 'i' } },
        ],
      };
    }

    if (clause['details.ukefDealId']) {
      const ukefDealId = clause['details.ukefDealId'];
      return {
        $or: [
          { 'details.ukefDealId': { $regex: ukefDealId, $options: 'i' } },
        ],
      };
    }

    return clause;
  });

  let result = {};
  if (amendedFilters.length === 1) {
    result = amendedFilters.pop(); // lint didn't like filter[0]..
  } else if (amendedFilters.length > 1) {
    result = {
      $and: amendedFilters,
    };
  }

  return result;
};

const allDealsFilters = (user, filters = []) => {
  const sanitisedFilters = [...filters];

  let result = {};
  if (sanitisedFilters.length === 1) {
    [result] = sanitisedFilters;
  } else if (sanitisedFilters.length > 1) {
    result = {
      $and: sanitisedFilters,
    };
  }

  return result;
};

const findDeals = async (requestingUser, filter) => {
  const query = dealsQuery(requestingUser, filter);
  return api.queryDeals(query);
};

exports.findDeals = findDeals;

const findPaginatedDeals = async (requestingUser, filter, start = 0, pagesize = 20) => {
  const query = dealsQuery(requestingUser, filter);
  return api.queryDeals(query, start, pagesize);
};
exports.findPaginatedDeals = findPaginatedDeals;

const findAllDeals = async (requestingUser, filters, sort) => {
  const sanitisedFilters = allDealsFilters(requestingUser, filters, sort);
  return api.queryAllDeals(sanitisedFilters, sort);
};
exports.findAllDeals = findAllDeals;

const findAllPaginatedDeals = async (requestingUser, filters, sort, start = 0, pagesize = 20) => {
  const sanitisedFilters = allDealsFilters(requestingUser, filters);

  return api.queryAllDeals(sanitisedFilters, sort, start, pagesize);
};
exports.findAllPaginatedDeals = findAllPaginatedDeals;

const findOneDeal = async (_id, callback) => {
  const deal = await api.findOneDeal(_id);

  if (callback) {
    callback(deal);
  }

  return deal;
};

exports.findOneDeal = findOneDeal;

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
    : DEFAULTS.DEAL.eligibility.status;

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
    lastUpdated: null,
  };
};

const createNewDealData = async (deal, maker) => {
  const newDeal = {
    ...DEFAULTS.DEAL,
    ...deal,
    bank: maker.bank,
    maker,
    details: {
      ...DEFAULTS.DEAL.details,
      ...deal.details,
    },
    eligibility: await createDealEligibility(deal.eligibility),
  };

  /*
  const validationErrors = getDealErrors(newDeal);

  if (validationErrors.count) {
    return {
      ...newDeal,
      validationErrors,
    };
  }
*/
  return newDeal;
};

const createDeal = async (dealBody, user) => {
  const deal = await createNewDealData(dealBody, user);
  return api.createDeal(deal, user);
};
exports.createDeal = createDeal;

exports.create = async (req, res) => {
  const { status, data } = await createDeal(req.body, req.user);
  return res.status(status).send(data);
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

const updateDeal = async (dealId, dealUpdate, user) => {
  const updatedDeal = await api.updateDeal(dealId, dealUpdate, user);

  return updatedDeal;
};
exports.updateDeal = updateDeal;

exports.update = async (req, res) => {
  const dealId = req.params.id;

  await findOneDeal(dealId, async (deal) => {
    if (!deal) res.status(404).send();

    if (!userHasAccessTo(req.user, deal)) {
      return res.status(401).send();
    }

    const updatedDeal = await updateDeal(
      dealId,
      req.body,
      req.user,
      deal,
    );

    return res.status(200).json(updatedDeal);
  });
};

exports.delete = async (req, res) => {
  const dealId = req.params.id;

  await findOneDeal(dealId, async (deal) => {
    if (!deal) res.status(404).send();

    if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
    } else {
      const response = await api.deleteDeal(dealId);
      res.status(response.status).send(response.body);
    }
  });
};

const importDeal = async (req, res) => {
  if (!isSuperUser(req.user)) {
    res.status(401).send();
  }

  const collection = await db.getCollection('deals');

  const newDeal = {
    ...req.body,
  };

  const validationErrors = getDealErrors(newDeal);

  if (validationErrors.count !== 0) {
    return res.status(400).send({
      ...newDeal,
      validationErrors,
    });
  }

  const response = await collection.insertOne({
    ...newDeal,
  }).catch((err) => {
    const status = err.code === 11000 ? 406 : 500;
    return res.status(status).send(err);
  });

  const createdDeal = response.ops && response.ops[0];
  return res.status(200).send(createdDeal);
};

exports.import = async (req, res) => {
  const result = await importDeal(req, res);
  return result;
};
