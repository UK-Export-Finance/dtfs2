const axios = require('axios');
require('dotenv').config();

const { QUERY, apollo } = require('./graphql');

const { gef } = require('./gef/api');

const urlRoot = process.env.DEAL_API_URL;

const createBank = async (bank, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/banks`,
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
    url: `${urlRoot}/v1/currencies`,
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
    url: `${urlRoot}/v1/countries`,
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
    url: `${urlRoot}/v1/deals`,
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
    url: `${urlRoot}/v1/deals/${dealId}`,
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
    url: `${urlRoot}/v1/industry-sectors`,
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
    url: `${urlRoot}/v1/mandatory-criteria`,
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
    url: `${urlRoot}/v1/eligibility-criteria`,
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
    url: `${urlRoot}/v1/users`,
    data: user,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const deleteBank = async (deal, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/banks/${deal.id}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const deleteCurrency = async (currency, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/currencies/${currency.id}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const deleteCountry = async (country, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/countries/${country.code}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const deleteDeal = async (dealId, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/deals/${dealId}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const deleteIndustrySector = async (industrySector, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/industry-sectors/${industrySector.code}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const deleteMandatoryCriteria = async (mandatoryCriteria, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/mandatory-criteria/${mandatoryCriteria.id}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const deleteEligibilityCriteria = async (eligibilityCriteria, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/eligibility-criteria/${eligibilityCriteria.id}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const deleteUser = async (user) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/v1/users/${user._id}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const listBanks = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/banks`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data.banks;
};

const listCurrencies = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/currencies`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data.currencies;
};

const listCountries = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/countries`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data.countries;
};

const listDeals = async (token) => {
  const response = await apollo('GET', QUERY.dealsQuery, {}, token);
  return response.data.allDeals.deals;
};

const listIndustrySectors = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/industry-sectors`,
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
    url: `${urlRoot}/v1/mandatory-criteria`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data.mandatoryCriteria;
};

const listEligibilityCriteria = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/eligibility-criteria`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data.eligibilityCriteria;
};

const listUsers = async () => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/v1/users`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data.users;
};

const resetIdCounters = async (token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/counters/reset`,
    data: {},
  })
    .then((response) => response.data)
    .catch((err) => { console.error(`ERROR resetting id counters: ${err}`); });
};

const updateCurrency = async (currency, token) => {
  const response = await axios({
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/currencies/${currency.id}`,
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
    url: `${urlRoot}/v1/countries/${country.code}`,
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
  resetIdCounters,
  updateCountry,
  updateCurrency,
  gef,
};
