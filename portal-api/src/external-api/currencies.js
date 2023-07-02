const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const { EXTERNAL_API_URL, API_KEY } = process.env;

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
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
  const response = await axios({
    method: 'get',
    url: `${EXTERNAL_API_URL}/currencies/${id}`,
    headers,
  }).catch((err) => {
    console.error('Error retrieving currency from External API. ', err?.response?.data, err?.status);
    return err?.response?.data;
  });

  return response.data;
};

module.exports = {
  getCurrencies,
  getCurrency,
};
