const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');
const { findAllGefFacilitiesByDealId } = require('../gef-facility/get-facilities.controller');

const extendDealWithFacilities = async (deal) => {
  const facilitiesCollection = await db.getCollection('facilities');
  const mappedDeal = { ...deal };
  const mappedBonds = [];
  const mappedLoans = [];
  const facilityIds = deal.facilities;
  const facilities = await facilitiesCollection.find({ dealId: ObjectId(deal._id) }).toArray();

  facilityIds.forEach((id) => {
    const facilityObj = facilities.find((f) => f._id.toHexString() === id.toHexString());

    if (facilityObj) {
      const { facilityType } = facilityObj;

      if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
        mappedBonds.push(facilityObj);
      }

      if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
        mappedLoans.push(facilityObj);
      }
    }
  });

  if (facilityIds && facilityIds.length > 0) {
    mappedDeal.bondTransactions = {
      items: mappedBonds,
    };

    mappedDeal.loanTransactions = {
      items: mappedLoans,
    };
  }

  return mappedDeal;
};

const queryDeals = async (query, start = 0, pagesize = 0) => {
  const collection = await db.getCollection('deals');
  const dealResults = await collection.find(query);
  const count = await dealResults.count();
  const deals = await dealResults
    .sort({ updatedAt: -1 })
    .skip(start)
    .limit(pagesize)
    .toArray();

  const extendedDeals = deals;

  extendedDeals.map(async (deal) => {
    if (deal.dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      const extendedDeal = await extendDealWithFacilities(deal);
      return extendedDeal;
    }

    return deal;
  });

  return {
    count,
    deals: extendedDeals,
  };
};
exports.queryDeals = queryDeals;

exports.queryDealsPost = async (req, res) => {
  const deals = await queryDeals(req.body.query, req.body.start, req.body.pagesize);
  res.status(200).send(deals);
};

const findOneDeal = async (_id, callback) => {
  const dealsCollection = await db.getCollection('deals');

  const deal = await dealsCollection.findOne({ _id: ObjectId(_id) });

  if (deal && deal.facilities) {
    const facilityIds = deal.facilities;

    if (facilityIds && facilityIds.length > 0) {
      const extendedDeal = await extendDealWithFacilities(deal);
      if (callback) {
        callback(extendedDeal);
      }

      return extendedDeal;
    }
  }

  if (callback) {
    callback(deal);
  }

  return deal;
};
exports.findOneDeal = findOneDeal;

const findOneGefDeal = async (_id, callback) => {
  const dealsCollection = await db.getCollection('deals');

  const deal = await dealsCollection.findOne({ _id: ObjectId(_id) });

  if (deal) {
    const facilities = await findAllGefFacilitiesByDealId(_id);

    deal.facilities = facilities;
  }

  if (callback) {
    callback(deal);
  }

  return deal;
};
exports.findOneGefDeal = findOneGefDeal;

exports.findOneDealGet = async (req, res) => {
  const deal = await findOneDeal(req.params.id);

  if (deal) {
    return res.status(200).send({
      deal,
    });
  }

  return res.status(404).send();
};

/**
 * Queries all deals in the deals collection (BSS, GEF)
 * @param {*} filters any filters for list, uses match spec
 * @param {*} sort any additional sort fields for list
 * @param {*} start where list should start - part of pagination.
 * @param {*} pagesize Size of each page - limits list results
 * @returns combined and formatted list of deals
 */

const queryAllDeals = async (filters = {}, sort = {}, start = 0, pagesize = 0) => {
  const collection = await db.getCollection('deals');

  const deals = await collection.aggregate([
    { $match: filters },
    {
      $project: {
        _id: 1,
        bankInternalRefName: '$bankInternalRefName',
        status: '$status',
        product: '$dealType',
        submissionType: '$submissionType',
        exporter: '$exporter.companyName',
        updatedAt: '$updatedAt',
      },
    },
    { $sort: { ...sort, updatedAt: -1 } },
    {
      $facet: {
        count: [{ $count: 'total' }],
        deals: [
          { $skip: start },
          ...(pagesize ? [{ $limit: pagesize }] : []),
        ],
      },
    },
    { $unwind: '$count' },
    {
      $project: {
        count: '$count.total',
        deals: 1,
      },
    },
  ]).toArray();

  return deals;
};

exports.queryAllDeals = async (req, res) => {
  try {
    const deals = await queryAllDeals(req.body.filters, req.body.sort, req.body.start, req.body.pagesize);
    res.status(200).send(deals);
  } catch (err) {
    console.error('Error querying all deals ', err);
    res.status(500).send(`Error: ${err}`);
  }
};
