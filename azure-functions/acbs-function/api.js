/**
 * ACBS durable functions API library deals with following HTTP methods:
 *
 * 1. GET
 * 2. POST
 * 3. PUT
 * 4. PATCH
 *
 * All of the function have argument validation check and return object verification in
 * case error object does not have expected properties due to network connection, SSL verification or other issues.
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
 * @returns {Promise<Object>} API response object
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
 * @returns {Promise<Object>} API response object
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
 * @returns {Promise<Object>} API response object
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
 * @returns {Promise<Object>} API response object
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
 * @returns {Promise<Object>} API response object
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
/**
 * Creates a facility covenant ID using the MDM API.
 *
 * @param {Object} payload - The payload containing the details for creating the facility covenant ID.
 * @returns {Promise<Object>} - The response from the MDM API.
 */
const createFacilityCovenantId = async (payload) => postMdm('numbers', payload);

// *** TFS ***

// GET

/**
 * Retrieves a facility by its identifier.
 *
 * @param {string} facilityIdentifier - The identifier of the facility.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const getFacility = async (facilityIdentifier) => get(`facilities/${facilityIdentifier}`);

/**
 * Retrieves the loan ID for a given facility identifier.
 *
 * @param {string} facilityIdentifier - The identifier of the facility.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const getLoanId = async (facilityIdentifier) => get(`facilities/${facilityIdentifier}/loans`);

// POST

/**
 * Creates a party record in the TFS system.
 *
 * @param {Object} payload - The payload containing the details for creating the party.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const createParty = async (payload) => post('parties', payload);

/**
 * Creates a deal record in the TFS system.
 *
 * @param {Object} payload - The payload containing the details for creating the deal.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const createDeal = async (payload) => post('deals', payload);

/**
 * Creates a deal investor record in the TFS system.
 *
 * @param {string} dealIdentifier - The identifier of the deal.
 * @param {Object} payload - The payload containing the details for creating the deal investor.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const createDealInvestor = async (dealIdentifier, payload) => post(`deals/${dealIdentifier}/investors`, payload);

/**
 * Creates a deal guarantee record in the TFS system.
 *
 * @param {string} dealIdentifier - The identifier of the deal.
 * @param {Object} payload - The payload containing the details for creating the deal guarantee.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const createDealGuarantee = async (dealIdentifier, payload) => post(`deals/${dealIdentifier}/guarantees`, payload);

/**
 * Creates a facility record in the TFS system.
 *
 * @param {Object} payload - The payload containing the details for creating the facility.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const createFacility = async (payload) => post('facilities', payload);

/**
 * Creates a facility investor record in the TFS system.
 *
 * @param {string} facilityIdentifier - The identifier of the facility.
 * @param {Object} payload - The payload containing the details for creating the facility investor.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const createFacilityInvestor = async (facilityIdentifier, payload) => post(`facilities/${facilityIdentifier}/investors`, payload);

/**
 * Creates a facility covenant record in the TFS system.
 *
 * @param {string} facilityIdentifier - The identifier of the facility.
 * @param {Object} payload - The payload containing the details for creating the facility covenant.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const createFacilityCovenant = async (facilityIdentifier, payload) => post(`facilities/${facilityIdentifier}/covenants`, payload);

/**
 * Creates a facility guarantee record in the TFS system.
 *
 * @param {string} facilityIdentifier - The identifier of the facility.
 * @param {Object} payload - The payload containing the details for creating the facility guarantee.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const createFacilityGuarantee = async (facilityIdentifier, payload) => post(`facilities/${facilityIdentifier}/guarantees`, payload);

/**
 * Creates a code value transaction record for a facility in the TFS system.
 *
 * @param {string} facilityIdentifier - The identifier of the facility.
 * @param {Object} payload - The payload containing the details for creating the code value transaction.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const createCodeValueTransaction = async (facilityIdentifier, payload) => post(`facilities/${facilityIdentifier}/activation-transactions`, payload);

/**
 * Creates a facility loan record in the TFS system.
 *
 * @param {string} facilityIdentifier - The identifier of the facility.
 * @param {Object} payload - The payload containing the details for creating the facility loan.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const createFacilityLoan = async (facilityIdentifier, payload) => post(`facilities/${facilityIdentifier}/loans`, payload);

/**
 * Creates a facility fee record in the TFS system.
 *
 * @param {string} facilityIdentifier - The identifier of the facility.
 * @param {Object} payload - The payload containing the details for creating the facility fee.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const createFacilityFee = async (facilityIdentifier, payload) => post(`facilities/${facilityIdentifier}/fixed-fees`, payload);

/**
 * Updates the loan amount for a facility in the TFS system.
 *
 * @param {string} facilityIdentifier - The identifier of the facility.
 * @param {string} loanId - The identifier of the loan.
 * @param {Object} payload - The payload containing the details for updating the loan amount.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const updateFacilityLoanAmount = async (facilityIdentifier, loanId, payload) =>
  post(`facilities/${facilityIdentifier}/loans/${loanId}/amendments/amount`, payload);

// PUT

/**
 * Updates a facility record in the TFS system.
 *
 * @param {string} facilityIdentifier - The identifier of the facility.
 * @param {string} updateType - The type of update to be performed.
 * @param {Object} payload - The payload containing the details for updating the facility.
 * @param {string} etag - The etag of the facility record.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const updateFacility = async (facilityIdentifier, updateType, payload, etag) => put(`facilities/${facilityIdentifier}?op=${updateType}`, payload, etag);

// PATCH

/**
 * Updates a facility loan record in the TFS system.
 *
 * @param {string} facilityIdentifier - The identifier of the facility.
 * @param {string} loanId - The identifier of the loan.
 * @param {Object} payload - The payload containing the details for updating the facility loan.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const updateFacilityLoan = async (facilityIdentifier, loanId, payload) => patch(`facilities/${facilityIdentifier}/loans/${loanId}`, payload);

/**
 * Updates a facility covenant record in the TFS system.
 *
 * @param {string} facilityIdentifier - The identifier of the facility.
 * @param {Object} payload - The payload containing the details for updating the facility covenant.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const updateFacilityCovenant = async (facilityIdentifier, payload) => patch(`facilities/${facilityIdentifier}/covenants`, payload);

/**
 * Updates a facility guarantee record in the TFS system.
 *
 * @param {string} facilityIdentifier - The identifier of the facility.
 * @param {Object} payload - The payload containing the details for updating the facility guarantee.
 * @returns {Promise<Object>} - The response from the TFS API.
 */
const updateFacilityGuarantee = async (facilityIdentifier, payload) => patch(`facilities/${facilityIdentifier}/guarantees`, payload);

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
};
