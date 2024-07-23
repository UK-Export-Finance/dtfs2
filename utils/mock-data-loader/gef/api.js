const axios = require('axios');
const { HEADERS } = require('@ukef/dtfs2-common');
const ApiError = require('../errors/api.error');
require('dotenv').config();

const { PORTAL_API_URL, DTFS_CENTRAL_API_KEY } = process.env;

const headers = {
  portal: {
    [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    Accepts: 'application/json',
  },
  central: {
    [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    Accepts: 'application/json',
    'x-api-key': DTFS_CENTRAL_API_KEY,
  },
};

/**
 * @param {object} data
 * @param {string} token
 * @returns {Promise<{ _id: string }>}
 */
const createApplication = async (data, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/application`,
    data,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const updateApplication = async (id, data, token) => {
  const response = await axios({
    method: 'put',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/application/${id}`,
    data,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

/**
 * @param {string} token
 * @returns {Promise<{ _id: string }[]>}
 */
const listDeals = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/application`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });
  return response.data.items;
};

/**
 * @param {object} data
 * @param {string} token
 * @returns {Promise<{ details: unknown }>}
 */
const createFacilities = async (data, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/facilities`,
    data,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const updateFacilities = async (facility, data, token) => {
  const response = await axios({
    method: 'put',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/facilities/${facility._id}`,
    data,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response;
};

const createEligibilityCriteria = async (data, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/eligibility-criteria`,
    data,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

/**
 * @param {string} token
 * @returns {Promise<unknown>}
 */
const latestEligibilityCriteria = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/eligibility-criteria/latest`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });
  return response.data;
};

const createMandatoryCriteriaVersioned = async (mandatoryCriteria, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/mandatory-criteria-versioned`,
    data: mandatoryCriteria,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const listMandatoryCriteriaVersioned = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      ...headers.portal,
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/gef/mandatory-criteria-versioned`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data.items;
};

module.exports = {
  createApplication,
  updateApplication,
  listDeals,
  createFacilities,
  updateFacilities,
  createEligibilityCriteria,
  latestEligibilityCriteria,
  createMandatoryCriteriaVersioned,
  listMandatoryCriteriaVersioned,
};
