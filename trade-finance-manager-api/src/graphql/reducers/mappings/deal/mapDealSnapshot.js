const mapTotals = require('./mapTotals');
const mapFacilities = require('../facilities/mapFacilities');
const mapSubmissionDetails = require('./mapSubmissionDetails');
const mapEligibility = require('./mapEligibility');

const mapDealSnapshot = (deal) => {
  const {
    dealSnapshot,
    tfm: dealTfm,
  } = deal;

  const {
    submissionDetails,
    facilities,
    eligibility,
  } = dealSnapshot;

  const mapped = {
    ...dealSnapshot,
    submissionDetails: mapSubmissionDetails(submissionDetails),
    eligibility: mapEligibility(eligibility),
    facilities: mapFacilities(facilities, dealSnapshot.details, dealTfm),
    totals: mapTotals(facilities),
    isFinanceIncreasing: false,
  };

  return mapped;
};

module.exports = mapDealSnapshot;
