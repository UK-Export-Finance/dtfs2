// ACBS API service it used to check that deal/facility ids are not already being used.
// the flow is:
// 1) number-generator API gives us deal and facility IDs
// 2) ACBS API tells us if the deal/facility IDs are already in use.

const axios = require('axios');
//

// DEAL ID THAT EXISTS in dev env: 0020900035
//

exports.checkDealId = async (dealId) => {
  const response = await axios({
    method: 'get',
    url: `${process.env.MULESOFT_API_ACBS_DEAL_URL}/${dealId}`,
    auth: {
      username: process.env.MULESOFT_API_KEY,
      password: process.env.MULESOFT_API_SECRET,
    },
  }).catch((catchErr) => catchErr);

  if (response.status) {
    return response.status;
  }

  if (response && response.response && response.response.status) {
    return response.response.status;
  }

  return new Error('Error calling ACBS API (deal)');
};

exports.checkFacilityId = async (facilityId) => {
  const response = await axios({
    method: 'get',
    url: `${process.env.MULESOFT_API_ACBS_FACILITY_URL}/${facilityId}`,
    auth: {
      username: process.env.MULESOFT_API_KEY,
      password: process.env.MULESOFT_API_SECRET,
    },
  }).catch((catchErr) => catchErr);

  if (response.status) {
    return response.status;
  }

  if (response && response.response && response.response.status === 404) {
    return 404;
  }

  return new Error('Error calling ACBS API (facility)');
};
