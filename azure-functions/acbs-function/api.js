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

// Domain
const apim = {
  tfs: process.env.APIM_TFS_URL,
  mdm: process.env.APIM_MDM_URL,
};

// Headers declaration
const tfs = {
  [String(process.env.APIM_TFS_KEY)]: process.env.APIM_TFS_VALUE,
  'Content-Type': 'application/json',
};
const mdm = {
  [String(process.env.APIM_MDM_KEY)]: process.env.APIM_MDM_VALUE,
  'Content-Type': 'application/json',
};

const badRequest = {
  status: 400,
  data: {
    error: 'Bad request',
  },
};

/**
 * Invokes TFS GET endpoint
 * @param {String} endpoint TFS endpoint
 * @returns {Object} API response object
 */
const get = async (endpoint) => {
  if (endpoint) {
    return axios({
      method: 'get',
      url: `${apim.tfs}${endpoint}`,
      headers: tfs,
    }).catch((error) => {
      console.error('Error calling TFS GET /%S', endpoint);

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
    return axios({
      method: 'post',
      url: `${apim.tfs}${endpoint}`,
      headers: tfs,
      data: [payload],
    }).catch((error) => {
      console.error('Error calling TFS POST /%S', endpoint);

      return {
        status: error.response ? error.response.status : error,
        data: { error: error.response ? error.response.data : error },
      };
    });
  }

  return badRequest;
};

/**
 * Invokes MDM POST endpoint
 * @param {String} endpoint MDM endpoint
 * @param {Object} payload Payload object
 * @returns {Object} API response object
 */
const postMdm = async (endpoint, payload) => {
  if (endpoint && payload) {
    return axios({
      method: 'post',
      url: `${apim.mdm}${endpoint}`,
      headers: mdm,
      data: [payload],
    }).catch((error) => {
      console.error('Error calling MDM POST /%S', endpoint);

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
    const additionalHeader = etag
      ? {
        'If-Match': etag,
      }
      : null;

    return axios({
      method: 'put',
      url: `${apim.tfs}${endpoint}`,
      headers: {
        ...tfs,
        ...additionalHeader,
      },
      data: payload,
    }).catch((error) => {
      console.error('Error calling TFS PUT /%S', endpoint);

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
    const additionalHeader = eTag
      ? {
        'If-Match': eTag,
      }
      : null;

    return axios({
      method: 'patch',
      url: `${apim.tfs}${endpoint}`,
      headers: {
        ...tfs,
        ...additionalHeader,
      },
      data: payload,
    }).catch((error) => {
      console.error('Error calling TFS PATCH /%S', endpoint);

      return {
        status: error.response ? error.response.status : error,
        data: { error: error.response ? error.response.data : error },
      };
    });
  }

  return badRequest;
};

// *** MDM ***

// POST
const createFacilityCovenantId = (payload) => postMdm('numbers', payload);

// *** TFS ***

// GET
const getFacility = (facilityId) => get(`facilities/${facilityId}`);
const getLoanId = (facilityId) => get(`facilities/${facilityId}/loans`);

// POST
const createParty = (payload) => post('parties', payload);
const createDeal = (payload) => post('deals', payload);
const createDealInvestor = (dealIdentifier, payload) => post(`deals/${dealIdentifier}/investors`, payload);
const createDealGuarantee = (dealIdentifier, payload) => post(`deals/${dealIdentifier}/guarantees`, payload);
const createFacility = (payload) => post('facilities', payload);
const createFacilityInvestor = (facilityIdentifier, payload) => post(`facilities/${facilityIdentifier}/investors`, payload);
const createFacilityCovenant = (facilityIdentifier, payload) => post(`facilities/${facilityIdentifier}/covenants`, payload);
const createFacilityGuarantee = (facilityIdentifier, payload) => post(`facilities/${facilityIdentifier}/guarantees`, payload);
const createCodeValueTransaction = (facilityIdentifier, payload) => post(`facilities/${facilityIdentifier}/activation-transactions`, payload);
const createFacilityLoan = (facilityIdentifier, payload) => post(`facilities/${facilityIdentifier}/loans`, payload);
const createFacilityFee = (facilityIdentifier, payload) => post(`facilities/${facilityIdentifier}/fixed-fees`, payload);
const updateFacilityLoanAmount = (facilityIdentifier, loanId, payload) => post(`facilities/${facilityIdentifier}/loans/${loanId}/amendments/amount`, payload);

// PUT
const updateFacility = (facilityIdentifier, updateType, payload, etag) => put(`facilities/${facilityIdentifier}?op=${updateType}`, payload, etag);

// PATCH
const updateFacilityLoan = (facilityIdentifier, loanId, payload) => patch(`facilities/${facilityIdentifier}/loans/${loanId}`, payload);

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
