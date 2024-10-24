const mapTotals = require('./mapTotals');
const mapFacilities = require('../facilities/mapFacilities');
const mapSubmissionDetails = require('./mapSubmissionDetails');
const mapEligibility = require('./mapEligibility');

const mapDealSnapshot = (deal) => {
  const { dealSnapshot, tfm: dealTfm } = deal;

  const { submissionDetails, facilities, eligibility } = dealSnapshot;

  return {
    ...dealSnapshot,
    submissionDetails: mapSubmissionDetails(submissionDetails),
    eligibility: eligibility ? mapEligibility(eligibility) : {},
    facilities: mapFacilities(facilities, dealSnapshot, dealTfm),
    totals: mapTotals(facilities),
    isFinanceIncreasing: false,
  };
};

module.exports = mapDealSnapshot;
