const mapTotals = require('./mappings/mapTotals');
const mapFacilities = require('./mappings/facilities/mapFacilities');
const mapSubmissionDetails = require('./mapSubmissionDetails');

// TODO: add unit test
// so that when this is changed, tests fail.

const dealReducer = (deal) => {
  const { tfm, dealSnapshot } = deal;

  const {
    submissionDetails,
    facilities,
  } = dealSnapshot;

  const result = {
    _id: deal._id, // eslint-disable-line no-underscore-dangle
    dealSnapshot: {
      ...dealSnapshot,
      totals: mapTotals(facilities),
      facilities: mapFacilities(facilities),
      submissionDetails: mapSubmissionDetails(submissionDetails),
    },
    tfm,
  };

  return result;
};

module.exports = dealReducer;
