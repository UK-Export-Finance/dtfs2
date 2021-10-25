const mapGefDealDetails = require('./mapGefDealDetails');
const mapGefFacilities = require('../gef-facilities/mapGefFacilities');
const mapTotals = require('../deal/mapTotals');
const mapGefSubmissionDetails = require('./mapGefSubmissionDetails');

const mapGefDealSnapshot = (dealSnapshot, dealTfm) => ({
  _id: dealSnapshot._id,
  dealType: dealSnapshot.dealType,
  isFinanceIncreasing: dealSnapshot.exporter.isFinanceIncreasing,
  details: mapGefDealDetails(dealSnapshot),
  submissionDetails: mapGefSubmissionDetails(dealSnapshot),
  eligibility: dealSnapshot.eligibility,
  dealFiles: {},
  facilities: mapGefFacilities(dealSnapshot, dealTfm),
  totals: mapTotals(dealSnapshot.facilities),
});

module.exports = mapGefDealSnapshot;
