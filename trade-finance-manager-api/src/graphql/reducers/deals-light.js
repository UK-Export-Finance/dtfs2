const mapSubmissionDetails = require('./mappings/deal/mapSubmissionDetails');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');
const mapGefSubmissionDetails = require('./mappings/gef-deal/mapGefSubmissionDetails');
const mapGefDealDetails = require('./mappings/gef-deal/mapGefDealDetails');
const mapDeals = require('./mappings/deal/mapDeals');

const mapBssDeal = (deal) => {
  const { _id, dealSnapshot } = deal;

  const mapped = {
    _id,
    dealSnapshot: {
      bank: dealSnapshot.bank,
      details: dealSnapshot.details,
      submissionType: dealSnapshot.submissionType,
      submissionDetails: mapSubmissionDetails(dealSnapshot.submissionDetails),
      exporter: dealSnapshot.exporter,
    },
    tfm: mapDealTfm(deal),
  };

  return mapped;
};

const mapGefDeal = (deal) => {
  const { _id, dealSnapshot } = deal;

  const mapped = {
    _id,
    dealSnapshot: {
      bank: dealSnapshot.bank,
      details: mapGefDealDetails(dealSnapshot),
      submissionType: dealSnapshot.submissionType,
      submissionDetails: mapGefSubmissionDetails(dealSnapshot),
      exporter: dealSnapshot.exporter,
    },
    tfm: mapDealTfm(deal),
  };

  return mapped;
};

const dealsLightReducer = (deals) =>
  mapDeals(
    deals,
    mapBssDeal,
    mapGefDeal,
  );

module.exports = {
  mapBssDeal,
  mapGefDeal,
  dealsLightReducer,
};
