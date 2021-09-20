const CONSTANTS = require('../../constants');
const mapSubmissionDetails = require('./mappings/deal/mapSubmissionDetails');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');
const mapGefSubmissionDetails = require('./mappings/gef-deal/mapGefSubmissionDetails');
const mapGefDealDetails = require('./mappings/gef-deal/mapGefDealDetails');

const mapDeal = (deal) => {
  const mapped = {
    _id: deal._id,
    dealSnapshot: {
      ...deal.dealSnapshot,
      submissionDetails: mapSubmissionDetails(deal.dealSnapshot.submissionDetails),
      isFinanceIncreasing: false,
    },
    tfm: mapDealTfm(deal),
  };

  return mapped;
};

const mapGefDeal = (deal) => {
  const mapped = {
    _id: deal._id,
    dealSnapshot: {
      _id: deal._id,
      details: mapGefDealDetails(deal.dealSnapshot),
      submissionDetails: mapGefSubmissionDetails(deal.dealSnapshot),
      isFinanceIncreasing: deal.dealSnapshot.exporter.isFinanceIncreasing,
    },
    tfm: mapDealTfm(deal),
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

const dealsLightReducer = (deals) => {
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
  dealsLightReducer,
};
