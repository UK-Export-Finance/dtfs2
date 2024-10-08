const axios = require('axios');
const { HEADERS } = require('@ukef/dtfs2-common');
require('dotenv').config();

const portalApiUrl = process.env.PORTAL_API_URL;

const createUser = async (user, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${portalApiUrl}/v1/users`,
    data: user,
  }).catch(() => ({ data: { success: false, username: user.username } }));

  return response.data;
};

const importBssEwcsDeal = async (deal, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${portalApiUrl}/v1/deals/import/BSS-EWCS`,
    data: deal,
  }).catch(({ response: data }) => ({ error: true, data: data.data }));

  return {
    success: !response.error,
    deal: response.data,
  };
};

const importGefDeal = async (deal, facilities, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${portalApiUrl}/v1/deals/import/GEF`,
    data: {
      deal,
      facilities,
    },
  }).catch(({ response: data }) => ({ error: true, data: data.data }));

  return {
    success: !response.error,
    data: response.data,
  };
};

const listUsers = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${portalApiUrl}/v1/users`,
  }).catch((error) => {
    console.info(`error: ${error}`);
  });

  return response.data.users;
};

const listBanks = async (token = '') => {
  const response = await axios({
    method: 'get',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${portalApiUrl}/v1/banks`,
  }).catch((error) => {
    console.info(`error: ${error}`);
  });

  return response.data.banks;
};

const listCountries = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${portalApiUrl}/v1/countries`,
  }).catch((error) => {
    console.info(`error: ${error}`);
  });

  return response.data.countries;
};

const listCurrencies = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${portalApiUrl}/v1/currencies`,
  }).catch((error) => {
    console.info(`error: ${error}`);
  });

  return response.data.currencies;
};

const listIndustrySectors = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${portalApiUrl}/v1/industry-sectors`,
  }).catch((error) => {
    console.info(`error: ${error}`);
  });

  return response.data.industrySectors;
};

const getGefEligibilityCriteria = async (token, version) => {
  const response = await axios({
    method: 'get',
    headers: {
      [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      Accepts: 'application/json',
      Authorization: token,
    },
    url: `${portalApiUrl}/v1/gef/eligibility-criteria/${version}`,
  }).catch((error) => {
    console.info(`error: ${error}`);
  });

  return response.data;
};

module.exports = {
  createUser,
  importBssEwcsDeal,
  importGefDeal,
  listUsers,
  listBanks,
  listCountries,
  listCurrencies,
  listIndustrySectors,
  getGefEligibilityCriteria,
};
