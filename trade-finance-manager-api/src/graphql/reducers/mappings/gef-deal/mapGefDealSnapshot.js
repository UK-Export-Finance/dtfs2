const mapGefDealDetails = require('./mapGefDealDetails');
const mapGefFacilities = require('../gef-facilities/mapGefFacilities');
const mapTotals = require('../deal/mapTotals');
const mapGefSubmissionDetails = require('./mapGefSubmissionDetails');

const mapGefDealSnapshot = (dealSnapshot, dealTfm) => ({
  _id: dealSnapshot._id,
  dealType: dealSnapshot.dealType,
  updatedAt: dealSnapshot.updatedAt,
  isFinanceIncreasing: dealSnapshot.exporter.isFinanceIncreasing,
  submissionType: dealSnapshot.submissionType,
  bank: dealSnapshot.bank,
  details: mapGefDealDetails(dealSnapshot),
  submissionDetails: mapGefSubmissionDetails(dealSnapshot),
  eligibility: dealSnapshot.eligibility,
  dealFiles: {},
  facilities: mapGefFacilities(dealSnapshot, dealTfm),
  totals: mapTotals(dealSnapshot.facilities),
});

module.exports = mapGefDealSnapshot;
