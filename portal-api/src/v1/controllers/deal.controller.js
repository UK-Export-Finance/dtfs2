const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const DEFAULTS = require('../defaults');
const { mongoDbClient: db } = require('../../drivers/db-client');
const { isValidMongoId } = require('../validation/validateIds');
const { userHasAccessTo } = require('../users/checks');
const validate = require('../validation/completeDealValidation');
const calculateStatuses = require('../section-status/calculateStatuses');
const calculateDealSummary = require('../deal-summary');
const { getLatestEligibilityCriteria } = require('./eligibilityCriteria.controller');
const { escapeOperators } = require('../helpers/escapeOperators');
const api = require('../api');
const computeSkipPosition = require('../helpers/computeSkipPosition');

/**
 * Find a deal (BSS, EWCS only)
 */
const findOneDeal = async (_id, callback) => {
  const deal = await api.findOneDeal(_id);

  if (callback) {
    callback(deal);
  }

  return deal;
};

exports.findOneDeal = findOneDeal;

const createDealEligibility = async (eligibility) => {
  if (eligibility) {
    const beingGivenEligibility = eligibility && eligibility.criteria;

    if (beingGivenEligibility) {
      const eligibilityObj = {
        ...eligibility,
        lastUpdated: null,
      };

      if (eligibility.status) {
        eligibilityObj.status = eligibility.status;
      } else {
        eligibilityObj.status = DEFAULTS.DEAL.eligibility.status;
      }

      return eligibilityObj;
    }
  }

  const latestEligibility = await getLatestEligibilityCriteria();

  return {
    ...latestEligibility,
    status: DEFAULTS.DEAL.eligibility.status,
  };
};

exports.createDealEligibility = createDealEligibility;

/**
 * Create default deal data (BSS, EWCS only)
 */
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

  return newDeal;
};

/**
 * Create a deal (BSS, EWCS only)
 */
const createDeal = async (dealBody, user, auditDetails) => {
  const deal = await createNewDealData(dealBody, user);
  return api.createDeal(deal, user, auditDetails);
};

exports.createDeal = createDeal;

exports.create = async (req, res) => {
  const auditDetails = generatePortalAuditDetails(req.user._id);
  const { status, data } = await createDeal(req.body, req.user, auditDetails);
  return res.status(status).send(data);
};

/**
 * Find a deal (BSS, EWCS only)
 */
exports.findOne = (req, res) => {
  if (!isValidMongoId(req?.params?.id)) {
    console.error('Find one deal API failed for deal id %s', req.params.id);
    return res.status(400).send({ status: 400, message: 'Invalid id provided' });
  }

  return findOneDeal(req.params.id, async (deal) => {
    if (!deal) {
      res.status(404).send();
    } else if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
    } else {
      // apply realtime validation so we catch any time-dependent fields
      //  that have -become- invalid..
      const validationErrors = await validate(deal);
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

/**
 * Sends a request to DTFS Central to update a deal
 * @param {object} params - The parameters for updating the deal.
 * @param {string} params.dealId - The ID of the deal being updated.
 * @param {object} params.dealUpdate - The update to be made to the deal.
 * @param {object} params.user - The user making the changes.
 * @param {object} params.auditDetails - The audit details for the update.
 * @returns {Promise<object | false>} The updated deal object.
 */
const updateDeal = async ({ dealId, dealUpdate, user, auditDetails }) => {
  const updatedDeal = await api.updateDeal({ dealId, dealUpdate, user, auditDetails });

  return updatedDeal;
};
exports.updateDeal = updateDeal;

/**
 * Update a deal (BSS, EWCS only)
 */
exports.update = async (req, res) => {
  const {
    user,
    params: { id: dealId },
    body: dealUpdate,
  } = req;

  await findOneDeal(dealId, async (deal) => {
    if (!deal) res.status(404).send();

    if (!userHasAccessTo(user, deal)) {
      return res.status(401).send();
    }

    const auditDetails = generatePortalAuditDetails(user._id);

    const updatedDeal = await updateDeal({ dealId, dealUpdate, user, auditDetails });

    return res.status(200).json(updatedDeal);
  });
};

/**
 * Delete a deal (BSS, EWCS only)
 */
exports.delete = async (req, res) => {
  const dealId = req.params.id;

  await findOneDeal(dealId, async (deal) => {
    if (!deal) res.status(404).send();

    if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
    } else {
      const response = await api.deleteDeal(dealId, generatePortalAuditDetails(req.user._id));
      res.status(response.status).send(response.body);
    }
  });
};

/**
 * Query all deals in the deals collection (BSS, EWCS, GEF)
 * @param {*} filters any filters for list, uses match spec
 * @param {*} sort any additional sort fields for list
 * @param {*} start where list should start - part of pagination.
 * @param {*} pagesize Size of each page - limits list results
 * @returns combined and formatted list of deals
 */
const queryAllDeals = async (filters = {}, sort = {}, start = 0, pagesize = 0) => {
  const startPage = computeSkipPosition(start, filters, sort);

  const collection = await db.getCollection('deals');

  const results = await collection
    .aggregate([
      { $match: escapeOperators(filters) },
      {
        $project: {
          _id: true,
          bankInternalRefName: '$bankInternalRefName',
          status: '$status',
          product: '$dealType',
          submissionType: '$submissionType',
          exporter: '$exporter.companyName',
          // exporter in lowercase for sorting
          lowerExporter: { $toLower: '$exporter.companyName' },
          updatedAt: { $toDouble: '$updatedAt' },
        },
      },
      {
        $sort: {
          ...sort,
          updatedAt: -1,
        },
      },
      {
        $facet: {
          count: [{ $count: 'total' }],
          deals: [{ $skip: startPage }, ...(pagesize ? [{ $limit: pagesize }] : [])],
        },
      },
      { $unwind: '$count' },
      {
        $project: {
          count: '$count.total',
          deals: true,
        },
      },
    ])
    .toArray();

  if (results.length) {
    const { count, deals } = results[0];

    return {
      count,
      deals,
    };
  }

  return {
    deals: [],
    count: 0,
  };
};

exports.getQueryAllDeals = async (req, res) => {
  const { start, pagesize, filters, sort } = req.body;

  const results = await queryAllDeals(filters, sort, start, pagesize);

  return res.status(200).send(results);
};
