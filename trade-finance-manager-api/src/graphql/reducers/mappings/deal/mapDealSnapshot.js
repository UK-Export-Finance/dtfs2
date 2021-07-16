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
    totals: mapTotals(facilities),
    facilities: mapFacilities(facilities, dealSnapshot.details, dealTfm),
    submissionDetails: mapSubmissionDetails(submissionDetails),
    eligibilityCriteria: eligibility.criteria,
  };
};

module.exports = mapDealSnapshot;
