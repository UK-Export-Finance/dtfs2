const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const referenceProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;

const getCountries = async () => {
  const response = await axios({
    method: 'get',
    url: `${referenceProxyUrl}/countries`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => err);

  return response.data && response.data.countries;
};

const getCountry = async (code) => {
  const response = await axios({
    method: 'get',
    url: `${referenceProxyUrl}/countries/${code}`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => err);

  return response.data;
};

module.exports = {
  getCountries,
  getCountry,
};
