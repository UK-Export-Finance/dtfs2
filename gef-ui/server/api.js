import axios from 'axios';
import MOCK_APPLICATION from './mock-data/application';

require('dotenv').config();

const urlRoot = process.env.DEAL_API_URL;

const getApplication = async (id, token) => {
  const mock = {
    ...MOCK_APPLICATION,
    id,
  };

  // const response = await axios({
  //   method: 'get',
  //   url: `${urlRoot}/v1/gef/application/${id}`,
  //   headers: {
  //     Authorization: token,
  //     'Content-Type': 'application/json',
  //   },
  // });

  return {
    status: 200,
    application: mock,
    validationErrors: false,
  };
};

const banks = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/banks`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return response.data.banks;
};

const getCurrencies = async (token, includeDisabled) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/currencies`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  const filteredCurrencies = response.data.currencies.filter((currency) => includeDisabled || !currency.disabled);

  return {
    status: response.status,
    currencies: filteredCurrencies,
  };
};

const getCountries = async (token, includeDisabled) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/countries`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  const filteredCountries = response.data.countries.filter((country) => includeDisabled || !country.disabled);

  return {
    status: response.status,
    countries: filteredCountries,
  };
};

const getIndustrySectors = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/industry-sectors`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return {
    status: response.status,
    industrySectors: response.data.industrySectors,
  };
};

const validateToken = async (token) => {
  if (!token) return false;

  const response = await axios({
    method: 'get',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    url: `${urlRoot}/v1/validate`,
  }).catch((err) => err.response);
  return response.status === 200;
};

const users = async (token) => {
  if (!token) return false;

  const response = await axios({
    method: 'get',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    url: `${urlRoot}/v1/users`,
  });

  return response.data;
};

const user = async (id, token) => {
  if (!token) return false;

  const response = await axios({
    method: 'get',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    url: `${urlRoot}/v1/users/${id}`,
  });

  return response.data;
};


export default {
  getApplication,
  banks,
  validateToken,
  users,
  user,
  getCurrencies,
  getCountries,
  getIndustrySectors,
};
