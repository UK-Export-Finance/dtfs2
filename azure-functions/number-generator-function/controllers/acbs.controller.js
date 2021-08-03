// ACBS API is used to check that deal/facility ids are not already being used.
//
// the flow is:
// 1) number-generator API gives us deal and facility IDs
// 2) ACBS API tells us if the deal/facility IDs are already in use.

const api = require('../api');

const checkDealId = async (dealId) => {
  console.log(`Checking deal id ${dealId} with ACBS`);

  const response = await api.checkDealId(dealId);

  if (response.status) {
    return response.status;
  }

  if (response && response.response && response.response.status) {
    return response.response.status;
  }

  return new Error('Error calling ACBS API (deal)');
};
exports.checkDealId = checkDealId;

const checkFacilityId = async (facilityId) => {
  console.log(`Checking facility id ${facilityId} with ACBS`);

  const response = await api.checkFacilityId(facilityId);

  if (response.status) {
    return response.status;
  }

  if (response && response.response && response.response.status) {
    return response.response.status;
  }

  return new Error('Error calling ACBS API (facility)');
};
exports.checkFacilityId = checkFacilityId;
