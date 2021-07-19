const db = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');

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
  const dealsCollection = await db.getCollection('deals');
  const facilitiesCollection = await db.getCollection('facilities');

  const deal = await dealsCollection.findOne({ _id });


  if (deal) {
    const facilityIds = deal.facilities;

    if (facilityIds && facilityIds.length > 0) {
      const mappedDeal = deal;
      const mappedBonds = [];
      const mappedLoans = [];

      const facilities = await facilitiesCollection.find({
        _id: {
          $in: facilityIds,
        },
      }).toArray();

      facilityIds.forEach((id) => {
        const facilityObj = facilities.find((f) => f._id === id); // eslint-disable-line no-underscore-dangle

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

      mappedDeal.bondTransactions = {
        items: mappedBonds,
      };

      mappedDeal.loanTransactions = {
        items: mappedLoans,
      };

      if (callback) {
        callback(mappedDeal);
      }

      return mappedDeal;
    }
  }

  if (callback) {
    callback(deal);
  }

  return deal;
};
exports.findOneDeal = findOneDeal;

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
 * Queries all deals, both BSS and GEF
 * @param {*} filters any filters for list, uses match spec
 * @param {*} sort any additional sort fields for list
 * @param {*} start where list should start - part of pagination.
 * @param {*} pagesize Size of each page - limits list results
 * @returns combined and formatted list of deals
 */

const queryAllDeals = async (filters = {}, sort = {}, start = 0, pagesize = 0) => {
  const collection = await db.getCollection('deals');

  const deals = await collection.aggregate([
    // clear the collection
    { $limit: 1 },
    { $project: { _id: 1 } },
    { $project: { _id: 0 } },
    // add data sets
    {
      $lookup: {
        from: 'deals',
        pipeline: [
          {
            $project: {
              _id: 1,
              bankId: '$details.owningBank.id',
              bankRef: '$details.bankSupplyContractName',
              status: '$details.status',
              product: 'BSS/EWCS',
              type: '$details.submissionType',
              exporter: '$submissionDetails.supplier-name',
              lastUpdate: { $convert: { input: '$details.dateOfLastAction', to: 'double' } },
            },
          },
        ],
        as: 'BSS',
      },
    },
    {
      $lookup: {
        from: 'gef-application',
        pipeline: [
          {
            $lookup: {
              from: 'gef-exporter',
              localField: 'exporterId',
              foreignField: '_id',
              as: 'exporter',
            },
          },
          { $unwind: '$exporter' },

          {
            $lookup: {
              from: 'gef-cover-terms',
              localField: 'coverTermsId',
              foreignField: '_id',
              as: 'coverTerms',
            },
          },
          { $unwind: '$coverTerms' },
          {
            $project: {
              _id: 1,
              bankRef: '$bankInternalRefName',
              bankId: 1,
              status: 1,
              product: 'GEF',
              type: '-', // TODO: add handling for GEF cover terms once field is available
              exporter: '$exporter.companyName',
              lastUpdate: { $ifNull: ['$updatedAt', '$createdAt'] },
            },
          },
        ],
        as: 'GEF',
      },
    },
    // combine data sets and flatten
    { $project: { union: { $concatArrays: ['$BSS', '$GEF'] } } },
    { $unwind: '$union' },
    { $replaceRoot: { newRoot: '$union' } },
    { $match: filters },
    { $sort: { ...sort, lastUpdate: -1 } },
    {
      $facet: {
        count: [{ $count: 'total' }],
        deals: [{ $skip: start }, ...pagesize ? [{ $limit: pagesize }] : []],
      },
    },
    { $unwind: '$count' },
    { $project: { count: '$count.total', deals: 1 } },
  ])
    .toArray();

  return deals[0];
};

exports.queryAllDeals = async (req, res) => {
  try {
    const deals = await queryAllDeals(req.body.filters, req.body.sort, req.body.start, req.body.pagesize);
    res.status(200).send(deals);
  } catch (err) {
    res.status(500).send(`Error: ${err}`);
  }
};
