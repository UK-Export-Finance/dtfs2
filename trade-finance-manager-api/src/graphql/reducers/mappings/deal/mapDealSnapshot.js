const mapTotals = require('./mapTotals');
const mapFacilities = require('../facilities/mapFacilities');
const mapSubmissionDetails = require('./mapSubmissionDetails');

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

  return {
    ...dealSnapshot,
    submissionDetails: mapSubmissionDetails(submissionDetails),
    eligibilityCriteria: eligibility.criteria,
    facilities: mapFacilities(facilities, dealSnapshot.details, dealTfm),
    totals: mapTotals(facilities),
    isFinanceIncreasing: false,
  };
};

module.exports = mapDealSnapshot;
