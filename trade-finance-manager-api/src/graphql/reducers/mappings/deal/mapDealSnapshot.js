const mapTotals = require('./mapTotals');
const mapFacilities = require('../facilities/mapFacilities');
const mapSubmissionDetails = require('./mapSubmissionDetails');
const mapEligibility = require('./mapEligibility');

const mapDealSnapshot = async (deal) => {
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
    facilities: await mapFacilities(facilities, dealSnapshot.details, dealTfm),
    totals: await mapTotals(facilities),
    isFinanceIncreasing: false,
  };

  return mapped;
};

module.exports = mapDealSnapshot;
