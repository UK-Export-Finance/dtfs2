const mapGefDealDetails = require('./mapGefDealDetails');
const mapGefFacilities = require('../gef-facilities/mapGefFacilities');
const mapTotals = require('../deal/mapTotals');
const mapGefSubmissionDetails = require('./mapGefSubmissionDetails');

// fields that need to be in GEF data so that we can map the following:
// submissionType
// submissionDate
// ukefDealId
// bankName
// maker {
//   firstname
//   surname
//   email
// }
// dealCurrency(e.g 'EUR')
// dealValue(e.g 1234)
// eligibility []

const mapGefDealSnapshot = (dealSnapshot) => ({
  _id: dealSnapshot._id,
  details: mapGefDealDetails(dealSnapshot),
  submissionDetails: mapGefSubmissionDetails(dealSnapshot),
  eligibilityCriteria: [],
  eligibility: {},
  dealFiles: {},
  facilities: mapGefFacilities(dealSnapshot),
  totals: mapTotals(dealSnapshot.facilities),
});

module.exports = mapGefDealSnapshot;
