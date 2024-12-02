const mapTotals = require('./mapTotals');
const mapFacilities = require('../facilities/mapFacilities');
const mapSubmissionDetails = require('./mapSubmissionDetails');
const mapEligibility = require('./mapEligibility');

/**
 * Maps BSS/EWCS deal snapshot from the database to a deal snapshot containing important and/or modified fields for use in TFM-UI and TFM-API.
 * @param {TfmDeal} deal
 * @returns {MappedBssEwcsDealSnapshot} The mapped deal to be used across TFM-UI and TFM-API.
 */
const mapDealSnapshot = (deal) => {
  const { dealSnapshot, tfm: dealTfm } = deal;

  const { submissionDetails, facilities, eligibility } = dealSnapshot;

  const mapped = {
    ...dealSnapshot,
    submissionDetails: mapSubmissionDetails(submissionDetails),
    eligibility: eligibility ? mapEligibility(eligibility) : {},
    facilities: mapFacilities(facilities, dealSnapshot, dealTfm),
    totals: mapTotals(facilities),
    isFinanceIncreasing: false,
  };

  return mapped;
};

module.exports = mapDealSnapshot;
