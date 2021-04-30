const mapTotals = require('./mappings/deal/mapTotals');
const mapFacilities = require('./mappings/facilities/mapFacilities');
const mapSubmissionDetails = require('./mapSubmissionDetails');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');

// TODO: add unit test
// so that when this is changed, tests fail.
const dealReducer = (deal) => {
  const {
    tfm: dealTfm,
    dealSnapshot,
  } = deal;

  const {
    details,
    submissionDetails,
    facilities,
    eligibility,
  } = dealSnapshot;

  const result = {
    _id: deal._id, // eslint-disable-line no-underscore-dangle
    dealSnapshot: {
      ...dealSnapshot,
      totals: mapTotals(facilities),
      facilities: mapFacilities(facilities, details, dealTfm),
      submissionDetails: mapSubmissionDetails(submissionDetails),
      eligibilityCriteria: eligibility.criteria,
    },
    tfm: mapDealTfm(dealTfm),
  };

  return result;
};

module.exports = dealReducer;
