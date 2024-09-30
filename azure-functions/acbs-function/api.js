/**
 * ACBS Durable Functions API Library
 * ----------------------------------
 * This module provides a set of functions to interact with the ACBS system using HTTP methods.
 * The supported HTTP methods are:
 * 1. GET
 * 2. POST
 * 3. PUT
 * 4. PATCH
 *
 * Each function includes argument validation and error handling to ensure robust API interactions.
 * In case of errors such as network issues or SSL verification failures, the functions return a standardized error object.
 *
 * Environment Variables
 * ---------------------
 * - `APIM_TFS_URL`: The base URL for the TFS API.
 * - `APIM_MDM_URL`: The base URL for the MDM API.
 * - `APIM_TFS_KEY`: The key for the TFS API.
 * - `APIM_TFS_VALUE`: The value for the TFS API key.
 * - `APIM_MDM_KEY`: The key for the MDM API.
 * - `APIM_MDM_VALUE`: The value for the MDM API key.
 *
 * Constants
 * ---------
 * - `HEADERS`: Contains the headers used for API requests.
 *
 * Functions
 * ---------
 * - `get`: Invokes a TFS GET endpoint.
 * - `post`: Invokes a TFS POST endpoint.
 * - `postMdm`: Invokes an MDM POST endpoint.
 * - `put`: Invokes a TFS PUT endpoint.
 * - `patch`: Invokes a TFS PATCH endpoint.
 *
 * MDM Functions
 * -------------
 * - `createFacilityCovenantId`: Creates a facility covenant ID using the MDM POST endpoint.
 *
 * TFS Functions
 * -------------
 * - `getFacility`: Retrieves a facility by its ID using the TFS GET endpoint.
 * - `getLoanId`: Retrieves the loan ID for a given facility ID using the TFS GET endpoint.
 * - `createParty`: Creates a party using the TFS POST endpoint.
 * - `createDeal`: Creates a deal using the TFS POST endpoint.
 * - `createDealInvestor`: Creates a deal investor using the TFS POST endpoint.
 * - `createDealGuarantee`: Creates a deal guarantee using the TFS POST endpoint.
 * - `createFacility`: Creates a facility using the TFS POST endpoint.
 * - `createFacilityInvestor`: Creates a facility investor using the TFS POST endpoint.
 * - `createFacilityCovenant`: Creates a facility covenant using the TFS POST endpoint.
 * - `createFacilityGuarantee`: Creates a facility guarantee using the TFS POST endpoint.
 * - `createCodeValueTransaction`: Creates a code value transaction using the TFS POST endpoint.
 * - `createFacilityLoan`: Creates a facility loan using the TFS POST endpoint.
 * - `createFacilityFee`: Creates a facility fee using the TFS POST endpoint.
 * - `updateFacilityLoanAmount`: Updates the facility loan amount using the TFS POST endpoint.
 * - `updateFacilityFixedFeeAmount`: Updates the facility fixed fee amount using the TFS POST endpoint.
 * - `updateFacility`: Updates a facility using the TFS PUT endpoint.
 * - `updateFacilityLoan`: Updates a facility loan using the TFS PATCH endpoint.
 * - `updateFacilityCovenant`: Updates a facility covenant using the TFS PATCH endpoint.
 * - `updateFacilityGuarantee`: Updates a facility guarantee using the TFS PATCH endpoint.
 *
 * @module api
 */

require('dotenv').config();
const axios = require('axios');
const {
  REQUEST: { HEADERS },
} = require('./constants');

// Domain
const apim = {
  tfs: process.env.APIM_TFS_URL,
  mdm: process.env.APIM_MDM_URL,
};

// Headers declaration
const tfs = {
  [String(process.env.APIM_TFS_KEY)]: process.env.APIM_TFS_VALUE,
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
};
const mdm = {
  [String(process.env.APIM_MDM_KEY)]: process.env.APIM_MDM_VALUE,
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
};

const badRequest = {
  status: 400,
  data: {
    error: 'Bad request',
  },
};

/**
 * Invokes TFS GET endpoint
 * @param {string} endpoint TFS endpoint
 * @returns {Promise<object>} API response object
 */
const get = async (endpoint) => {
  if (endpoint) {
    return axios({
      method: 'get',
      url: `${apim.tfs}${endpoint}`,
      headers: tfs,
    }).catch((error) => {
      console.error('Error calling TFS GET /%s', endpoint);

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
 * @param {string} endpoint TFS endpoint
 * @param {Object} payload Payload object
 * @returns {Promise<object>} API response object
 */
const post = async (endpoint, payload) => {
  if (endpoint && payload) {
    return axios({
      method: 'post',
      url: `${apim.tfs}${endpoint}`,
      headers: tfs,
      data: [payload],
    }).catch((error) => {
      console.error('Error calling TFS POST /%s', endpoint);

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
 * @param {string} endpoint MDM endpoint
 * @param {Object} payload Payload object
 * @returns {Promise<object>} API response object
 */
const postMdm = async (endpoint, payload) => {
  if (endpoint && payload) {
    return axios({
      method: 'post',
      url: `${apim.mdm}${endpoint}`,
      headers: mdm,
      data: [payload],
    }).catch((error) => {
      console.error('Error calling MDM POST /%s', endpoint);

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
 * @param {string} endpoint TFS endpoint
 * @param {Object} payload Payload object
 * @param {string} etag Entity tag
 * @returns {Promise<object>} API response object
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
      console.error('Error calling TFS PUT /%s', endpoint);

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
 * @param {string} endpoint TFS endpoint
 * @param {Object} payload Payload object
 * @param {string} etag Entity tag
 * @returns {Promise<object>} API response object
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
      console.error('Error calling TFS PATCH /%s', endpoint);

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
const updateFacilityFixedFeeAmount = (facilityIdentifier, payload) => post(`facilities/${facilityIdentifier}/fixed-fees/amendments/amount`, payload);

// PUT
const updateFacility = (facilityIdentifier, updateType, payload, etag) => put(`facilities/${facilityIdentifier}?op=${updateType}`, payload, etag);

// PATCH
const updateFacilityLoan = (facilityIdentifier, loanId, payload) => patch(`facilities/${facilityIdentifier}/loans/${loanId}`, payload);
const updateFacilityCovenant = (facilityIdentifier, payload) => patch(`facilities/${facilityIdentifier}/covenants`, payload);
const updateFacilityGuarantee = (facilityIdentifier, payload) => patch(`facilities/${facilityIdentifier}/guarantees`, payload);

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
  updateFacilityCovenant,
  updateFacilityGuarantee,
  updateFacilityFixedFeeAmount,
};
