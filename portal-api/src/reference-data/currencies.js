const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const referenceProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;

const getCurrencies = async () => {
  const response = await axios({
    method: 'get',
    url: `${referenceProxyUrl}/currencies`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => {
    console.error('Error retrieving currencies from Reference Data API. ', err?.response, err?.status);
    return err;
  });

  return response.data && response.data.currencies;
};

const getCurrency = async (id) => {
  const response = await axios({
    method: 'get',
    url: `${referenceProxyUrl}/currencies/${id}`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => {
    console.error('Error retrieving currency from Reference Data API. ', err?.response, err?.status);
    return err;
  });

  return response.data;
};

module.exports = {
  getCurrencies,
  getCurrency,
};
