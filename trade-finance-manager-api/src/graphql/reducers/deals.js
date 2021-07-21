const CONSTANTS = require('../../constants');
const mapSubmissionDetails = require('./mappings/deal/mapSubmissionDetails');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');
const mapGefSubmissionDetails = require('./mappings/gef-deal/mapGefSubmissionDetails');
const mapGefDealDetails = require('./mappings/gef-deal/mapGefDealDetails');

const mapDeal = (deal) => {
  // manually merge facilities into facilities array.
  // this saves performance.
  // without this, we'd need to do a query for every facility in a deal,
  // for every single deal in the 'all deals' query.

  const dealWithMappedFacilities = {
    _id: deal._id, // eslint-disable-line no-underscore-dangle
    dealSnapshot: {
      ...deal.dealSnapshot,
      facilities: [
        ...deal.dealSnapshot.bondTransactions.items,
        ...deal.dealSnapshot.loanTransactions.items,
      ],
    },
    tfm: deal.tfm,
  };

  const mapped = {
    _id: deal._id, // eslint-disable-line no-underscore-dangle
    dealSnapshot: {
      ...deal.dealSnapshot,
      submissionDetails: mapSubmissionDetails(deal.dealSnapshot.submissionDetails),
    },
    tfm: mapDealTfm(dealWithMappedFacilities),
  };

  return mapped;
};

const mapGefDeal = (deal) => {
  const mapped = {
    _id: deal._id, // eslint-disable-line no-underscore-dangle
    dealSnapshot: {
      _id: deal._id, // eslint-disable-line no-underscore-dangle
      details: mapGefDealDetails(deal.dealSnapshot),
      submissionDetails: mapGefSubmissionDetails(deal.dealSnapshot),
    },
    tfm: {},
  };

  return mapped;
};

const mapDeals = (deals) => {
  const mapped = [];

  deals.forEach((deal) => {
    if (deal.dealSnapshot.dealType && deal.dealSnapshot.dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
      mapped.push(mapGefDeal(deal));
    } else {
      mapped.push(mapDeal(deal));
    }
  });

  return mapped;
};

const dealsReducer = (deals) => {
  const mappedDeals = mapDeals(deals);

  return {
    count: mappedDeals.length,
    deals: mappedDeals,
  };
};

module.exports = {
  mapDeal,
  mapGefDeal,
  mapDeals,
  dealsReducer,
};
