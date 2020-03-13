const axios = require('axios');
require('dotenv').config();

// TODO multiple services talk to the same api; we end up writing basically the same code twice to achieve this
//  ... a binary repo to publish things to so we can share? ... local references in package.json??

const urlRoot = process.env.DEAL_API_URL;

const createDeal = async (deal) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/deals`,
    data: deal,
  });

  return response.data;
};

const createBank = async (bank) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/banks`,
    data: bank,
  });

  return response.data;
};

const createBondCurrency = async (bondCurrency) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/bondCurrencies`,
    data: bondCurrency,
  });

  return response.data;
};

const createCountry = async (country) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/countries`,
    data: country,
  });

  return response.data;
};

const createIndustrySector = async (industrySector) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/api/industry-sectors`,
    data: industrySector,
  });

  return response.data;
};

module.exports = {
  createDeal,
  createBank,
  createBondCurrency,
  createCountry,
  createIndustrySector,
};
