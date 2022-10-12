const axios = require('axios');
require('dotenv').config();

const { gef } = require('./gef/api');

const portalApiUrl = process.env.DEAL_API_URL;

const createBank = async (bank, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApiUrl}/v1/banks`,
    data: bank,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const createCurrency = async (currency, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApiUrl}/v1/currencies`,
    data: currency,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const createCountry = async (country, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApiUrl}/v1/countries`,
    data: country,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const createDeal = async (deal, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApiUrl}/v1/deals`,
    data: deal,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const getDeal = async (dealId, token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApiUrl}/v1/deals/${dealId}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const createIndustrySector = async (industrySector, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApiUrl}/v1/industry-sectors`,
    data: industrySector,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const createMandatoryCriteria = async (mandatoryCriteria, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApiUrl}/v1/mandatory-criteria`,
    data: mandatoryCriteria,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const createEligibilityCriteria = async (eligibilityCriteria, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApiUrl}/v1/eligibility-criteria`,
    data: eligibilityCriteria,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const createUser = async (user) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${portalApiUrl}/v1/users`,
    data: user,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const listCurrencies = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApiUrl}/v1/currencies`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data.currencies;
};

const listIndustrySectors = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApiUrl}/v1/industry-sectors`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data.industrySectors;
};

const listMandatoryCriteria = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApiUrl}/v1/mandatory-criteria`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data.mandatoryCriteria;
};

const listUsers = async () => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${portalApiUrl}/v1/users`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data.users;
};
const updateCurrency = async (currency, token) => {
  const response = await axios({
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApiUrl}/v1/currencies/${currency.id}`,
    data: currency,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const updateCountry = async (country, token) => {
  const response = await axios({
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${portalApiUrl}/v1/countries/${country.code}`,
    data: country,
  }).catch((err) => { console.error(`err: ${err}`); });

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
  listCurrencies,
  listIndustrySectors,
  listMandatoryCriteria,
  listUsers,
  updateCountry,
  updateCurrency,
  gef,
};
