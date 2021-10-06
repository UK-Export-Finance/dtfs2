const mapSubmissionDetails = require('./mappings/deal/mapSubmissionDetails');
const mapFacilities = require('./mappings/facilities/mapFacilities');
const mapTotals = require('./mappings/deal/mapTotals');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');
const mapGefSubmissionDetails = require('./mappings/gef-deal/mapGefSubmissionDetails');
const mapGefDealDetails = require('./mappings/gef-deal/mapGefDealDetails');
const mapGefFacilities = require('./mappings/gef-facilities/mapGefFacilities');
const mapDeals = require('./mappings/deal/mapDeals');

const mapBssDeal = (deal) => {
  const { _id, dealSnapshot } = deal;

  const mapped = {
    _id,
    dealSnapshot: {
      ...dealSnapshot,
      submissionDetails: mapSubmissionDetails(dealSnapshot.submissionDetails),
      facilities: mapFacilities(dealSnapshot.facilities, dealSnapshot.details, deal.tfm),
      dealFiles: dealSnapshot.dealFiles,
      eligibilityCriteria: dealSnapshot.eligibility.criteria,
      totals: mapTotals(dealSnapshot.facilities),
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
      _id,
      details: mapGefDealDetails(dealSnapshot),
      submissionDetails: mapGefSubmissionDetails(dealSnapshot),
      facilities: mapGefFacilities(dealSnapshot, deal.tfm),
    },
    tfm: mapDealTfm(deal),
  };

  return mapped;
};

const dealsReducer = (deals) =>
  mapDeals(
    deals,
    mapBssDeal,
    mapGefDeal,
  );

module.exports = {
  mapBssDeal,
  mapGefDeal,
  mapDeals,
  dealsReducer,
};
