const axios = require('axios');
const { HEADERS } = require('@ukef/dtfs2-common');
require('dotenv').config();

const { gef } = require('./gef/api');
const { createLoggedInUserSession } = require('./database/user-repository');
const FailedToCreateUserError = require('./errors/failed-to-create-user.error');
const ApiError = require('./errors/api.error');
const FailedToDeleteBankError = require('./errors/failed-to-delete-bank.error');
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

const createCurrency = async (currency, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/currencies`,
    data: currency,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const createCountry = async (country, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/countries`,
    data: country,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

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

const createIndustrySector = async (industrySector, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/industry-sectors`,
    data: industrySector,
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

const deleteBank = async (deal, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/banks/${deal.id}`,
  }).catch((error) => {
    throw new FailedToDeleteBankError({ bankId: deal.id, cause: error });
  });

  return response.data;
};

const deleteCurrency = async (currency, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/currencies/${currency.id}`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const deleteCountry = async (country, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/countries/${country.code}`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const deleteDeal = async (dealId, token) => {
  const response = await axios({
    method: 'delete',
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

const deleteIndustrySector = async (industrySector, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/industry-sectors/${industrySector.code}`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const deleteMandatoryCriteria = async (version, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/mandatory-criteria/${version}`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const deleteEligibilityCriteria = async (version, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/eligibility-criteria/${version}`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const deleteUser = async (user, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/users/${user._id}`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });
  return response.data;
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

const listCurrencies = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/currencies`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data.currencies;
};

const listCountries = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/countries`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data.countries;
};

const listDeals = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/deals`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data.deals;
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

const listEligibilityCriteria = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/eligibility-criteria`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data.eligibilityCriteria;
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

const updateCurrency = async (currency, token) => {
  const response = await axios({
    method: 'put',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/currencies/${currency.id}`,
    data: currency,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const updateCountry = async (country, token) => {
  const response = await axios({
    method: 'put',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${PORTAL_API_URL}/v1/countries/${country.code}`,
    data: country,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

module.exports = {
  createBank,
  createCurrency,
  createCountry,
  createDeal,
  getDeal,
  createIndustrySector,
  createMandatoryCriteria,
  createEligibilityCriteria,
  createUser,
  createInitialUser,
  deleteBank,
  deleteCurrency,
  deleteCountry,
  deleteDeal,
  deleteIndustrySector,
  deleteMandatoryCriteria,
  deleteEligibilityCriteria,
  deleteUser,
  listBanks,
  listCurrencies,
  listCountries,
  listDeals,
  listIndustrySectors,
  listMandatoryCriteria,
  listEligibilityCriteria,
  listUsers,
  loginViaPortal,
  updateCountry,
  updateCurrency,
  createInitialTfmUser,
  loginTfmUser,
  gef,
};
