require('dotenv').config();
const axios = require('axios');

const headers = {
  [String(process.env.APIM_MDM_KEY)]: process.env.APIM_MDM_VALUE,
  'Content-Type': 'application/json',
};

const getAPI = async (type) => {
  const response = await axios({
    method: 'get',
    url: `${process.env.MULESOFT_API_UKEF_TF_EA_URL}/${type}`,
    auth: {
      username: process.env.MULESOFT_API_KEY,
      password: process.env.MULESOFT_API_SECRET,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => ({
    status: err.response.status,
  }));

  return response;
};

/**
 * Post to MDM endpoints
 * @param {String} endpoint MDM endpoints
 * @param {Object} payload Payload
 * @returns API endpoint invoke response
 */
const postToAPI = async (endpoint, payload) => {
  console.info('Calling number generator');

  if (!process.env.APIM_MDM_URL) {
    return false;
  }

  const url = `${process.env.APIM_MDM_URL}${endpoint}`;
  const request = {
    method: 'post',
    url,
    headers,
    data: [payload],
  };

  const response = await axios(request)
    .catch(({
      response: {
        status, statusText, data,
      },
    }) => ({
      error: {
        status,
        statusText,
        data,
        request,
        date: new Date().toISOString(),
      },
    }));

  return response;
};

const checkDealId = (dealId) => getAPI(`deal/${dealId}`);
const checkFacilityId = (facilityId) => getAPI(`facility/${facilityId}`);

/**
 * Call number generator
 * @param {Integer} numberType Number type usually `1` represents for deal and facilities
 * @returns Number generator response object
 */
const callNumberGenerator = (numberType) => postToAPI('numbers', {
  numberTypeId: numberType,
  createdBy: 'Portal v2/TFM',
  requestingSystem: 'Portal v2/TFM',
});

module.exports = {
  checkDealId,
  checkFacilityId,
  callNumberGenerator,
};
