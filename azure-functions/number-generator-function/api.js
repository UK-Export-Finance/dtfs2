require('dotenv').config();
const axios = require('axios');

/**
 * Get to TFS endpoints
 * @param {type} type Endpoint to invoke
 * @returns API endpoint invoke response
 */
const getAPI = async (type) => {
  console.info('Invoking TFS GET /%s', type);

  const url = `${process.env.APIM_TFS_URL}${type}`;
  const headers = {
    [String(process.env.APIM_TFS_KEY)]: process.env.APIM_TFS_VALUE,
    'Content-Type': 'application/json',
  };

  const response = await axios({
    method: 'get',
    url,
    headers,
    validateStatus(status) {
      // Resolve only if the status code is less than 500
      return status < 500;
    },
  }).catch((error) => {
    console.error('Error while invoking TFS GET %s', error);
    return false;
  });

  return response;
};

/**
 * Post to MDM endpoints
 * @param {String} endpoint MDM endpoints
 * @param {Object} payload Payload
 * @returns API endpoint invoke response
 */
const postAPI = async (endpoint, payload) => {
  console.info('Invoking MDM POST %s', endpoint);

  if (!process.env.APIM_MDM_URL) {
    return false;
  }

  const url = `${process.env.APIM_MDM_URL}${endpoint}`;
  const headers = {
    [String(process.env.APIM_MDM_KEY)]: process.env.APIM_MDM_VALUE,
    'Content-Type': 'application/json',
  };

  const request = {
    method: 'post',
    url,
    headers,
    data: [payload],
  };

  const response = await axios(request).catch((error) => {
    console.error('Error while invoking TFS POST %s %O', endpoint, error);
    return error;
  });

  return response;
};

/**
 * UKEF deal ID validation check
 * @param {String} dealId UKEF deal ID
 * @returns {Object} Response object
 */
const checkDealId = (dealId) => getAPI(`deals/${dealId}`);

/**
 * UKEF facility ID validation check
 * @param {String} facilityId UKEF facility ID
 * @returns {Object} Response object
 */
const checkFacilityId = (facilityId) => getAPI(`facilities/${facilityId}`);

/**
 * Call number generator
 * @param {Integer} numberType Number type usually `1` represents for deal and facilities
 * @returns Number generator response object
 */
const callNumberGenerator = (numberType) =>
  postAPI('numbers', {
    numberTypeId: numberType,
    createdBy: 'Portal v2/TFM',
    requestingSystem: 'Portal v2/TFM',
  });

module.exports = {
  checkDealId,
  checkFacilityId,
  callNumberGenerator,
};
