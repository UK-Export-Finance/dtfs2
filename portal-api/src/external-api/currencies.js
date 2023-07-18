const axios = require('axios');
const dotenv = require('dotenv');

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
  }).catch((error) => {
    console.error('Error retrieving currencies from External API. ', error?.response?.data, error?.status);
    return error?.response?.data;
  });

  return response.data && response.data.currencies;
};

const getCurrency = async (id) => {
  const response = await axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/currencies/${id}`,
    headers,
  }).catch((error) => {
    console.error('Error retrieving currency from External API. ', error?.response?.data, error?.status);
    return error?.response?.data;
  });

  return response.data;
};

module.exports = {
  getCurrencies,
  getCurrency,
};
