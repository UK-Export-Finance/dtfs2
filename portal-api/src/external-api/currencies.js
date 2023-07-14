const axios = require('axios');
const dotenv = require('dotenv');
const { isValidRegex } = require('../v1/validation/validateIds');
const { CODE } = require('../constants/regex');

dotenv.config();

const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': EXTERNAL_API_KEY,
};

const getCurrencies = async () => {
  const response = await axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/currencies`,
    headers,
  }).catch((err) => {
    console.error('Error retrieving currencies from External API. ', err?.response?.data, err?.status);
    return err?.response?.data;
  });

  return response.data && response.data.currencies;
};

const getCurrency = async (id) => {
  if (!isValidRegex(CODE, id)) {
    console.error('currencies.getCurrency: invalid code provided', id);
    return {
      status: 400
    };
  }

  const response = await axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/currencies/${id}`,
    headers,
  }).catch((err) => {
    console.error('Error retrieving currency from External API. ', err?.response?.data, err?.status);
    return {
      status: 404,
      error: err?.response?.data,
    };
  });

  if (response.data) {
    return {
      status: 200,
      data: response.data,
    };
  }

  return { status: 404 };
};

module.exports = {
  getCurrencies,
  getCurrency,
};
