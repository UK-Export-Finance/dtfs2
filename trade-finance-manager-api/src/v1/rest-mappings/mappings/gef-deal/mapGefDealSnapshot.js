const mapGefDealDetails = require('./mapGefDealDetails');
const mapGefFacilities = require('../gef-facilities/mapGefFacilities');
const mapTotals = require('../deal/mapTotals');
const mapGefSubmissionDetails = require('./mapGefSubmissionDetails');

/**
 * Maps GEF deal snapshot from the database to a deal snapshot containing important and/or modified fields for use in TFM-UI and TFM-API.
 * @param {GefDeal} dealSnapshot
 * @param {TfmDeal} dealTfm
 * @returns {MappedGefDealSnapshot} The mapped deal to be used across TFM-UI and TFM-API.
 */
const mapGefDealSnapshot = (dealSnapshot, dealTfm) => ({
  _id: dealSnapshot._id,
  dealType: dealSnapshot.dealType,
  status: dealSnapshot.status,
  updatedAt: dealSnapshot.updatedAt,
  isFinanceIncreasing: dealSnapshot.exporter.isFinanceIncreasing,
  submissionType: dealSnapshot.submissionType,
  maker: dealSnapshot.maker,
  bank: dealSnapshot.bank,
  exporter: {
    companyName: dealSnapshot.exporter.companyName,
  },
  bankInternalRefName: dealSnapshot.bankInternalRefName,
  additionalRefName: dealSnapshot.additionalRefName,
  details: mapGefDealDetails(dealSnapshot),
  submissionDetails: mapGefSubmissionDetails(dealSnapshot),
  eligibility: dealSnapshot.eligibility,
  supportingInformation: dealSnapshot.supportingInformation,
  facilities: mapGefFacilities(dealSnapshot, dealTfm),
  totals: mapTotals(dealSnapshot.facilities),
});

module.exports = mapGefDealSnapshot;
