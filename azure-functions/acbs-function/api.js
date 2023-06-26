/**
 * ACBS durable functions API library deals with following HTTP methods:
 *
 * 1. GET
 * 2. POST
 * 3. PUT
 * 4. PATCH
 *
 * All of the function have argument validation check and return object verification in
 * case err object does not have expected properties due to network connection, SSL verification or other issues.
 */

require('dotenv').config();
const axios = require('axios');

const headers = {
  [String(process.env.APIM_TFS_KEY)]: process.env.APIM_TFS_VALUE,
  'Content-Type': 'application/json',
};
const badRequest = {
  status: 400,
  data: {},
};

/**
 * Invokes TFS GET endpoint
 * @param {String} endpoint TFS endpoint
 * @returns {Object} API response object
 */
const get = async (endpoint) => {
  if (endpoint) {
    const url = `${process.env.APIM_MDM_URL}/${endpoint}`;

    return axios({
      method: 'get',
      url,
      headers,
    }).catch((error) => {
      console.error('Error calling ACBS GET /%s', endpoint);

      return {
        status: error.response ? error.response.status : error,
        data: { error: error.response ? error.response.data : error },
      };
    });
  }

  return badRequest;
};

/**
 * Invokes TFS POST endpoint
 * @param {String} endpoint TFS endpoint
 * @param {Object} payload Payload object
 * @returns {Object} API response object
 */
const post = async (endpoint, payload) => {
  if (endpoint && payload) {
    const url = `${process.env.APIM_MDM_URL}/${endpoint}`;

    return axios({
      method: 'post',
      url,

      headers,
      data: [payload],
    }).catch((error) => {
      console.error('Error calling ACBS POST /%s', endpoint);

      return {
        status: error.response ? error.response.status : error,
        data: { error: error.response ? error.response.data : error },
      };
    });
  }

  return badRequest;
};

/**
 * Invokes TFS PUT endpoint
 * @param {String} endpoint TFS endpoint
 * @param {Object} payload Payload object
 * @param {String} etag Entity tag
 * @returns {Object} API response object
 */
const put = async (endpoint, payload, etag) => {
  if (endpoint && payload) {
    const url = `${process.env.APIM_MDM_URL}/${endpoint}`;

    const additionalHeader = etag
      ? {
        'If-Match': etag,
      }
      : null;

    return axios({
      method: 'put',
      url,
      headers: {
        ...headers,
        ...additionalHeader,
      },
      data: payload,
    }).catch((error) => {
      console.error('Error calling ACBS PUT /%s', endpoint);

      return {
        status: error.response ? error.response.status : error,
        data: { error: error.response ? error.response.data : error },
      };
    });
  }

  return badRequest;
};

/**
 * Invokes TFS PATCH endpoint
 * @param {String} endpoint TFS endpoint
 * @param {Object} payload Payload object
 * @param {String} etag Entity tag
 * @returns {Object} API response object
 */
const patch = async (endpoint, payload, eTag) => {
  if (endpoint && payload) {
    const url = `${process.env.APIM_MDM_URL}/${endpoint}`;

    const additionalHeader = eTag
      ? {
        'If-Match': eTag,
      }
      : null;

    return axios({
      method: 'patch',
      url,
      headers: {
        ...headers,
        ...additionalHeader,
      },
      data: payload,
    }).catch((error) => {
      console.error('Error calling ACBS PATCH /%s', endpoint);

      return {
        status: error.response ? error.response.status : error,
        data: { error: error.response ? error.response.data : error },
      };
    });
  }

  return badRequest;
};

/**
 * Various ACBS API calls, consuming myriads of
 * HTTP methods and endpoints.
 */

// GET
const getFacility = (facilityId) => get(`facility/${facilityId}`);
const getLoanId = (facilityId) => get(`facility/${facilityId}/loan`);

// POST
const createParty = (payload) => post('party', payload);
const createDeal = (payload) => post('deal', payload);
const createDealInvestor = (payload) => post('deal/investor', payload);
const createDealGuarantee = (payload) => post('deal/guarantee', payload);
const createFacility = (payload) => post('facility', payload);
const createFacilityInvestor = (payload) => post('facility/investor', payload);
const createFacilityCovenantId = (payload) => post('numbers', payload);
const createFacilityCovenant = (payload) => post('facility/covenant', payload);
const createFacilityGuarantee = (payload) => post('facility/guarantee', payload);
const createCodeValueTransaction = (payload) => post('facility/codeValueTransaction', payload);
const createFacilityLoan = (payload) => post('facility/loan', payload);
const createFacilityFee = (payload) => post('facility/fixedFee', payload);
const updateFacilityLoanAmount = (facilityId, loanId, payload) => post(`facility/${facilityId}/loan/${loanId}/amountAmendment`, payload);

// PUT
const updateFacility = (facilityId, updateType, payload, etag) => put(`facility/${facilityId}?op=${updateType}`, payload, etag);

// PATCH
const updateFacilityLoan = (facilityId, loanId, payload) => patch(`facility/${facilityId}/loan/${loanId}`, payload);

module.exports = {
  getFacility,
  getLoanId,
  createParty,
  createDeal,
  createDealInvestor,
  createDealGuarantee,
  createFacility,
  createFacilityInvestor,
  createFacilityCovenantId,
  createFacilityCovenant,
  createFacilityGuarantee,
  createCodeValueTransaction,
  createFacilityLoan,
  createFacilityFee,
  updateFacility,
  updateFacilityLoan,
  updateFacilityLoanAmount,
};
