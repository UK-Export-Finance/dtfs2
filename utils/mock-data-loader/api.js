const axios = require('axios');
const { HEADERS } = require('@ukef/dtfs2-common');
require('dotenv').config();

const { createLoggedInUserSession } = require('./database/user-repository');
const FailedToCreateUserError = require('./errors/failed-to-create-user.error');
const ApiError = require('./errors/api.error');
const FailedToGetBanksError = require('./errors/get-banks.error');

const { PORTAL_API_URL, PORTAL_API_KEY, TFM_API_URL, TFM_API_KEY } = process.env;

const createBank = async (bank, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/banks`,
    data: bank,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

/**
 * @param {object} deal
 * @param {string} token
 * @returns {Promise<{ _id: string }>}
 */
const createDeal = async (deal, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/deals`,
    data: deal,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

/**
 * @param {string} dealId
 * @param {string} token
 * @returns {Promise<{ deal: { _id: ObjectId; mockId: number } }>}
 */
const getDeal = async (dealId, token) => {
  const response = await axios({
    method: 'get',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/deals/${dealId}`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const createMandatoryCriteria = async (mandatoryCriteria, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/mandatory-criteria`,
    data: mandatoryCriteria,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const createEligibilityCriteria = async (eligibilityCriteria, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/eligibility-criteria`,
    data: eligibilityCriteria,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const createUser = async (user, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/users`,
    data: user,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const createInitialUser = async (user) => {
  const response = await axios({
    method: 'post',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      'x-api-key': PORTAL_API_KEY,
      Accepts: 'application/json',
    },
    url: `${PORTAL_API_URL}/v1/user`,
    data: user,
  });

  return response.data;
};

const createInitialTfmUser = async (user) => {
  await axios({
    method: 'post',
    url: `${TFM_API_URL}/v1/user`,
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      'x-api-key': TFM_API_KEY,
    },
    data: user,
  }).catch((error) => {
    throw new FailedToCreateUserError({ username: user.username, cause: error });
  });
};

/**
 * @param {{ username: string, password: string }} user
 * @returns {Promise<string>}
 */
const loginTfmUser = async (user) => {
  const response = await axios({
    method: 'post',
    url: `${TFM_API_URL}/v1/login`,
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
    },
    data: { username: user.username, password: user.password },
  });

  return response?.data?.token;
};

const listBanks = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/banks`,
  }).catch((error) => {
    throw new FailedToGetBanksError({ cause: error });
  });

  return response.data.banks;
};

const listIndustrySectors = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/industry-sectors`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data.industrySectors;
};

const listMandatoryCriteria = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/mandatory-criteria`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data.mandatoryCriteria;
};

const listUsers = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/users`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data.users;
};

/*
 * Due to 2fa changes, we now do not call endpoints to login to portal.
 * This is due to portal now using a email link to complete login.
 */
const loginViaPortal = async (user) => createLoggedInUserSession(user);

module.exports = {
  createBank,
  createDeal,
  getDeal,
  createMandatoryCriteria,
  createEligibilityCriteria,
  createUser,
  createInitialUser,
  listBanks,
  listIndustrySectors,
  listMandatoryCriteria,
  listUsers,
  loginViaPortal,
  createInitialTfmUser,
  loginTfmUser,
};
